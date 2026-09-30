"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import LabIcon, { type LabIconName } from "./LabIcon";
import styles from "./SelectionWheel.module.css";

/** A translated command or a nested command group in the selection wheel. */
export type WheelItem = {
  id: string;
  label: string;
  icon: LabIconName;
  disabled?: boolean;
  hint?: string;
  children?: WheelItem[];
  run?: () => void;
};

/** Viewport-clamped radial menu with nested actions, keyboard navigation and outside-click dismissal. */
export default function SelectionWheel({
  x,
  y,
  title,
  items,
  close,
}: {
  x: number;
  y: number;
  title: string;
  items: WheelItem[];
  close: () => void;
}) {
  const { t } = useI18n();
  const [group, setGroup] = useState<WheelItem | null>(null);
  const menu = useRef<HTMLDivElement>(null);
  const shown = group?.children ?? items;
  useEffect(() => {
    menu.current
      ?.querySelector<HTMLButtonElement>("button:not(:disabled)")
      ?.focus();
  }, [group]);
  useEffect(() => {
    const dismiss = () => close();
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", dismiss, true);
    return () => {
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", dismiss, true);
    };
  }, [close]);
  const diameter = Math.min(
    360,
    window.innerWidth - 16,
    window.innerHeight - 16,
  );
  const radius = diameter / 2;
  const left = Math.min(
    window.innerWidth - radius - 8,
    Math.max(radius + 8, x),
  );
  const top = Math.min(
    window.innerHeight - radius - 8,
    Math.max(radius + 8, y),
  );
  function sector(index: number) {
    const step = (2 * Math.PI) / shown.length;
    const start = -Math.PI / 2 + index * step - step / 2 + 0.012;
    const end = start + step - 0.024;
    const points: string[] = [];
    for (const [radius, reverse] of [
      [49, false],
      [26, true],
    ] as const) {
      for (let i = 0; i <= 48; i++) {
        const angle = start + (end - start) * (reverse ? 1 - i / 48 : i / 48);
        points.push(
          `${50 + Math.cos(angle) * radius}% ${50 + Math.sin(angle) * radius}%`,
        );
      }
    }
    return `polygon(${points.join(",")})`;
  }
  return createPortal(
    <div
      className={styles.overlay}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={menu}
        className={styles.wheel}
        role="menu"
        aria-label={group?.label ?? title}
        style={{ left, top, width: diameter, height: diameter }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            if (group) setGroup(null);
            else close();
          }
          if (
            [
              "ArrowLeft",
              "ArrowRight",
              "ArrowUp",
              "ArrowDown",
              "Tab",
              "Home",
              "End",
            ].includes(event.key)
          ) {
            event.preventDefault();
            const buttons = [
              ...menu.current!.querySelectorAll<HTMLButtonElement>(
                "button:not(:disabled)",
              ),
            ];
            const index = buttons.indexOf(
              document.activeElement as HTMLButtonElement,
            );
            const backwards =
              event.key === "ArrowLeft" ||
              event.key === "ArrowUp" ||
              (event.key === "Tab" && event.shiftKey);
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? buttons.length - 1
                  : (index + (backwards ? -1 : 1) + buttons.length) %
                    buttons.length;
            buttons[next]?.focus();
          }
        }}
      >
        <div className={styles.center}>
          <span>{group?.label ?? title}</span>
          <button
            role="menuitem"
            aria-label={
              group ? t("scene2d.wheelBack") : t("scene2d.wheelClose")
            }
            title={group ? t("scene2d.wheelBack") : t("scene2d.wheelClose")}
            onClick={() => (group ? setGroup(null) : close())}
          >
            <LabIcon name={group ? "back" : "close"} />
          </button>
        </div>
        {shown.map((item, index) => {
          const angle = -Math.PI / 2 + (index * 2 * Math.PI) / shown.length;
          return (
            <button
              key={item.id}
              role="menuitem"
              className={styles.item}
              disabled={item.disabled}
              title={item.hint ?? item.label}
              aria-label={item.label}
              aria-haspopup={item.children ? "menu" : undefined}
              style={{
                clipPath: sector(index),
              }}
              onClick={() => {
                if (item.children) setGroup(item);
                else {
                  item.run?.();
                  close();
                }
              }}
            >
              <span
                className={styles.content}
                style={{
                  left: `${50 + Math.cos(angle) * 38}%`,
                  top: `${50 + Math.sin(angle) * 38}%`,
                }}
              >
                <LabIcon name={item.icon} />
                <span>
                  {item.label}
                  {item.children ? " ›" : ""}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}
