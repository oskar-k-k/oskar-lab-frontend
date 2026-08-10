import Image from "next/image";

type Props = {
    title: string;
    description?: string;
    href?: string;
    image?: string;
};

export default function Card({
                                 title,
                                 description,
                                 href,
                                 image
                             }: Props) {

    return (
        <a
            href={href}
            className="block overflow-hidden rounded-xl border"
        >
            {image && (
                <Image
                    src={image}
                    alt={title}
                    width={400}
                    height={250}
                    className="w-full object-cover"
                />
            )}

            <div className="p-4">
                <h2>{title}</h2>

                {description && (
                    <p>{description}</p>
                )}
            </div>
        </a>
    );
}