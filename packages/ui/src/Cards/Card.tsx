import Image from "next/image";
import styles from "./Card.module.css";

/** Properties for a global content preview. */
type Props = {
    /** Main title used as card heading and image alternative text. */
    title: string;
    /** Optional supporting copy below the title. */
    description?: string;
    /** Optional internal or external target for linked cards. */
    href?: string;
    /** Optional preview image shown above the card content. */
    image?: string;
    /** Controls the reserved preview image format. */
    imageAspect?: "wide" | "square";
    /** Optional additional class for local card variants. */
    className?: string;
};

/** Reusable content preview that can optionally link to another page. */
export default function Card({
                                 title,
                                 description,
                                 href,
                                 image,
                                 imageAspect = "wide",
                                 className = "",
                             }: Props) {

    const content = (
        <>
            {image && (
                <Image
                    src={image}
                    alt={title}
                    width={400}
                    height={250}
                    sizes="(max-width: 600px) 100vw, 400px"
                    className={`${styles.image} ${styles[imageAspect]}`}
                />
            )}

            <div className={styles.content}>
                <h2 className={styles.title}>{title}</h2>

                {description && (
                    <p className={styles.description}>{description}</p>
                )}
            </div>
        </>
    );

    const cardClassName = `${styles.card} ${className}`;
    return href
        ? <a href={href} className={cardClassName}>{content}</a>
        : <article className={cardClassName}>{content}</article>;
}
