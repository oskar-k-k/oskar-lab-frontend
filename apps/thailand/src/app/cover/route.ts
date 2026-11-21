import {hasAccess, privateHeaders} from "../../lib/access";
export async function GET() {
    if (!await hasAccess()) return new Response(null, {status:404, headers:privateHeaders});
    return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="#103e41"/><circle cx="405" cy="185" r="85" fill="#f7c781"/><path d="M0 380 Q150 270 300 390 T600 380 V600 H0Z" fill="#2b7771"/><path d="M0 450 Q150 340 300 460 T600 440 V600 H0Z" fill="#50a799"/><text x="45" y="110" fill="#fff" font-family="sans-serif" font-size="42">THAILAND</text><text x="45" y="540" fill="#fff" font-family="sans-serif" font-size="25">Unsere Reise</text></svg>', {headers:{...privateHeaders, "Content-Type":"image/svg+xml"}});
}
