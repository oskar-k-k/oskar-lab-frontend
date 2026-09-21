"use client";

import {useId, useRef, useState, type ReactNode} from "react";
import styles from "./Tabs.module.css";

/** One tab with a unique ID, visible label and locally available content. */
export interface TabItem {
    id: string;
    label: string;
    content: ReactNode;
}

/** Uncontrolled tabs; defaultValue is read on mount and falls back to the first item. */
export interface TabsProps {
    items: readonly TabItem[];
    /** Accessible name describing the content switcher. */
    label: string;
    defaultValue?: string;
}

/** Switches content without navigation; hidden panels stay mounted to preserve local state. */
export default function Tabs({items, label, defaultValue}: TabsProps) {
    const id = useId();
    const [value, setValue] = useState(defaultValue);
    const buttons = useRef<(HTMLButtonElement | null)[]>([]);
    const selected = items.find(item => item.id === value)?.id ?? items[0]?.id;
    if (!items.length) return null;
    return <div className={styles.tabs}>
        <div className={styles.list} role="tablist" aria-label={label}>
            {items.map((item, index) => <button type="button" role="tab" key={item.id}
                className={styles.tab} id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`}
                aria-selected={item.id === selected} tabIndex={item.id === selected ? 0 : -1}
                ref={element => {buttons.current[index] = element;}}
                onClick={() => setValue(item.id)} onKeyDown={event => {
                    let next: number;
                    switch (event.key) {
                        case "ArrowRight": next = (index + 1) % items.length; break;
                        case "ArrowLeft": next = (index - 1 + items.length) % items.length; break;
                        case "Home": next = 0; break;
                        case "End": next = items.length - 1; break;
                        default: return;
                    }
                    event.preventDefault();
                    setValue(items[next].id);
                    buttons.current[next]?.focus();
                }}>{item.label}</button>)}
        </div>
        {items.map((item, index) => <div key={item.id} role="tabpanel" className={styles.panel}
            id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`}
            hidden={item.id !== selected} tabIndex={0}>{item.content}</div>)}
    </div>;
}
