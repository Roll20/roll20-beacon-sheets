import { lightDarkMode } from "./darkMode";

export function productLineStyle(gameSystem:string,lightDark:string,args?:any){
    document.body.className = "";
    lightDarkMode(lightDark);
    switch(gameSystem){
        case 'fage1e':
        case 'fage2e':
            document.body.classList.add("fantasyAge");
            if(args?.cthulhuMythos){
                document.documentElement.style.setProperty('--theme-primary', '#005a3f');
            } else if(args?.technofantasy){
                document.documentElement.style.setProperty('--theme-primary', '#9d3916');
            } else {
                document.documentElement.style.setProperty('--theme-primary', '#1e4e7a');
            }
        break;
        case 'mage':
            document.body.classList.add("modernAge");
            if(args?.cyberpunk){
                document.documentElement.style.setProperty('--theme-primary', '#9f0058');
            }else {
                document.documentElement.style.setProperty('--theme-primary', '#027CAC');
            }
        break;
        case 'blue rose':
            document.body.classList.add("bluerose");
            document.documentElement.style.setProperty('--theme-primary', '#007bba');
        break;
        case 'cthulhu':
            document.body.classList.add("cthulhu");
            document.documentElement.style.setProperty('--theme-primary', '#1D3729');
        break;
      }
}