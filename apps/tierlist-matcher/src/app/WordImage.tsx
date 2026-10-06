import {wordGroups} from "./words";

const drawings: Record<string, React.ReactNode> = {
    pizza: <><path d="M24 20Q50 9 76 20L50 82Z" fill="#f2ce79"/><path d="M24 20Q50 9 76 20" stroke="#cf8950" strokeWidth="10"/><circle cx="42" cy="33" r="5" fill="#e47864"/><circle cx="56" cy="46" r="5" fill="#e47864"/><circle cx="48" cy="62" r="4" fill="#e47864"/></>,
    sushi: <><ellipse cx="50" cy="60" rx="29" ry="20" fill="#355543"/><path d="M21 39V60M79 39V60" stroke="#355543" strokeWidth="3"/><ellipse cx="50" cy="39" rx="29" ry="20" fill="#f0ecd7"/><ellipse cx="50" cy="39" rx="13" ry="10" fill="#ed967e"/><path d="M48 31L58 45" stroke="#83b37d" strokeWidth="6"/></>,
    pommes: <><path d="M26 50L32 81H68L75 50Z" fill="#df8773"/>{[32,42,52,62,70].map((x,i)=><path key={x} d={`M${x} 55V${19+i%2*8}`} stroke="#edce72" strokeWidth="7"/>)}<path d="M38 64Q50 73 63 64" fill="none" stroke="#f5e4c4" strokeWidth="3"/></>,
    pasta: <><path d="M17 50Q22 82 50 82Q78 82 83 50Z" fill="#9ac8be"/><path d="M24 47Q34 24 46 45T73 40M29 43Q38 20 53 43T78 44" stroke="#edcc7e" strokeWidth="5" fill="none"/><path d="M45 43Q53 31 61 44" stroke="#df8773" strokeWidth="7" fill="none"/></>,
    döner: <><path d="M24 29Q50 11 76 29L57 83H43Z" fill="#d6ab77"/><path d="M29 34L42 74M71 34L57 74" stroke="#f0d7ad" strokeWidth="7"/><path d="M33 30L42 22L50 30L58 22L67 30" stroke="#8fbd79" fill="none" strokeWidth="8"/><path d="M36 37L62 37" stroke="#df8773" strokeWidth="5"/></>,
    salat: <><path d="M19 52Q26 83 50 83T81 52Z" fill="#9ac8be"/><ellipse cx="37" cy="40" rx="14" ry="20" fill="#8fbd79" transform="rotate(-25 37 40)"/><ellipse cx="61" cy="40" rx="14" ry="20" fill="#b9d889" transform="rotate(25 61 40)"/><circle cx="47" cy="50" r="9" fill="#df8773"/></>,
    pfannkuchen: <><ellipse cx="50" cy="73" rx="34" ry="10" fill="#d9e6d6"/>{[59,49,39].map(y=><ellipse key={y} cx="50" cy={y} rx="29" ry="10" fill="#e7bf7c" stroke="#c48b53" strokeWidth="3"/>)}<path d="M40 33L57 28L65 36L48 40Z" fill="#f4e095"/></>,
    eis: <><path d="M30 44L50 86L70 44Z" fill="#d7ac70"/><circle cx="50" cy="32" r="23" fill="#e7a8bb"/><path d="M37 56L57 67M43 70L63 57" stroke="#ad7d4f" strokeWidth="2"/></>,
    burger: <><path d="M20 38Q25 13 50 13T80 38Z" fill="#e2b273"/><path d="M21 44L34 50L46 43L59 50L77 43" stroke="#9dc37a" strokeWidth="7" fill="none"/><path d="M23 55H77" stroke="#73544a" strokeWidth="12"/><path d="M23 65L54 73L76 65" stroke="#edcc7e" strokeWidth="6" fill="none"/><path d="M22 77Q50 87 78 77" stroke="#e2b273" strokeWidth="12" fill="none"/></>,
    burrito: <><rect x="29" y="18" width="42" height="68" rx="19" fill="#e5c68e" transform="rotate(25 50 50)"/><path d="M29 52L65 71" stroke="#c29666" strokeWidth="3"/><ellipse cx="62" cy="22" rx="18" ry="9" fill="#8fbd79" transform="rotate(25 62 22)"/><path d="M50 19L68 25" stroke="#df8773" strokeWidth="5"/></>,
    kino: <><path d="M18 38H82V79H18Z" fill="#9ab6dc"/><path d="M16 22L78 12L82 30L20 40Z" fill="#d9e6d6"/><path d="M28 20L38 36M47 17L57 33M66 14L76 30" stroke="#355543" strokeWidth="7"/><path d="M44 49L61 59L44 69Z" fill="#355543"/></>,
    spaziergang: <><ellipse cx="34" cy="59" rx="10" ry="19" fill="#b9d889" transform="rotate(-20 34 59)"/><ellipse cx="64" cy="34" rx="10" ry="19" fill="#9ac8be" transform="rotate(20 64 34)"/><circle cx="26" cy="31" r="8" fill="#b9d889"/><circle cx="72" cy="63" r="8" fill="#9ac8be"/></>,
    kochen: <><path d="M19 49Q20 76 50 76T81 49Z" fill="#9ac8be"/><path d="M12 47H88M82 50H94" stroke="#d9e6d6" strokeWidth="5"/><path d="M33 36Q23 28 33 18M51 36Q41 28 51 18M69 36Q59 28 69 18" stroke="#b9d889" strokeWidth="3" fill="none"/></>,
    museum: <><path d="M13 31L50 12L87 31Z" fill="#b6a2dc"/><path d="M16 80H84M19 36H81" stroke="#d9e6d6" strokeWidth="6"/>{[27,50,73].map(x=><path key={x} d={`M${x} 38V76`} stroke="#b6a2dc" strokeWidth="9"/>)}</>,
    picknick: <><path d="M22 44L30 81H70L78 44Z" fill="#d7ac70"/><path d="M33 43Q33 11 50 11T67 43" fill="none" stroke="#d7ac70" strokeWidth="6"/><path d="M29 57H72M32 69H69M40 48V79M59 48V79" stroke="#ab8052" strokeWidth="3"/></>,
    konzert: <><path d="M40 65V25L76 16V57" stroke="#b6a2dc" strokeWidth="7" fill="none"/><path d="M40 36L76 27" stroke="#b6a2dc" strokeWidth="8"/><ellipse cx="29" cy="70" rx="15" ry="10" fill="#b6a2dc"/><ellipse cx="65" cy="62" rx="15" ry="10" fill="#b6a2dc"/></>,
    brettspiele: <><rect x="21" y="21" width="58" height="58" rx="12" fill="#edc08c"/>{[[34,34],[66,34],[50,50],[34,66],[66,66]].map(([x,y])=><circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="#355543"/>)}</>,
    wandern: <><path d="M9 79L38 22L67 79Z" fill="#9ac8be"/><path d="M39 79L67 34L91 79Z" fill="#8fbd79"/><path d="M27 44L38 22L49 44L38 39Z" fill="#e7eee0"/><circle cx="76" cy="18" r="9" fill="#edce72"/></>,
    café: <><path d="M22 35H68V63Q68 79 45 79T22 63Z" fill="#edc08c"/><path d="M69 40H76Q92 52 76 64H69" stroke="#edc08c" strokeWidth="6" fill="none"/><path d="M33 25Q25 17 33 9M52 25Q44 17 52 9" stroke="#b9d889" strokeWidth="3" fill="none"/></>,
    bowling: <><path d="M29 18Q18 18 24 34L20 59Q16 77 30 77T40 59L35 34Q41 18 29 18Z" fill="#e7eee0"/><path d="M24 36H35" stroke="#df8773" strokeWidth="6"/><circle cx="66" cy="62" r="23" fill="#b6a2dc"/><circle cx="60" cy="53" r="3" fill="#355543"/><circle cx="69" cy="51" r="3" fill="#355543"/><circle cx="66" cy="60" r="3" fill="#355543"/></>,
};
const intimate = wordGroups.intimacy.map(word => word.toLowerCase());
/** Local, original vector illustrations. Intimate terms use abstract symbols. */
export default function WordImage({word, className = ""}: {word: string; className?: string}) {
    const key = word.trim().toLowerCase();
    const index = intimate.indexOf(key);
    const drawing = drawings[key] ?? (index >= 0 ? <g transform={`rotate(${index * 22.5} 50 50)`}><circle cx="39" cy="50" r="22" stroke="#b6a2dc" strokeWidth="6" fill="none"/><circle cx="61" cy="50" r="22" stroke="#b9d889" strokeWidth="6" fill="none"/><circle cx="50" cy="50" r="4" fill="#edc08c"/></g> : <text x="50" y="63" textAnchor="middle" fontSize="34" fontFamily="Arial,sans-serif" fontWeight="700" fill="#b9d889">{word.trim().slice(0, 2).toUpperCase()}</text>);
    return <svg className={`word-image ${className}`} viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="16" fill="#202c22"/>{drawing}</svg>;
}
