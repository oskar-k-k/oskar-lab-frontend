import styles from "./Grid.module.css";

type Props = {
    children: React.ReactNode;
}

export default function Grid({children}: Props){

    const css = `${styles.grid}`

   return(
    <div className={css}>
        {children}
    </div>
   ) 
}