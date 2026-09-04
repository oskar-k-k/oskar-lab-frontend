import Image from "next/image";
import Link from "next/link";
import styles from "./Card.module.css";

/** Properties for a global content preview. */
type Props = {
    title: string;
    description?: string;
    href?: string;
    image?: string;
};

/** Reusable content preview that can optionally link to another page. */
export default function Card({
                                 title,
                                 description,
                                 href,
                                 image
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
                    className={styles.image}
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

    const className = styles.card;
    return href
        ? <Link href={href} className={className}>{content}</Link>
        : <article className={className}>{content}</article>;
}
