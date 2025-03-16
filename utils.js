export const adjustUrl = (addresses)=>{

return  addresses.map(addr => ((!addr.includes("https") && !addr.includes("www"))? `https://www.${addr}` : !addr.includes("www")? `https://www.${addr.slice(8)}` :  addr.startsWith("https") ? addr :`https://${addr}`));
}