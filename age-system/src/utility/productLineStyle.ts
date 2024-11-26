import { lightDarkMode } from "./darkMode";

export function productLineStyle(gameSystem:string,lightDark:string){
    document.body.className = "";
    lightDarkMode(lightDark);
    switch(gameSystem){
        case 'fage1e':
        case 'fage2e':
            document.body.classList.add("fantasyAge");
            document.documentElement.style.setProperty('--theme-primary', '#1e4e7a');
        break;
        case 'mage':
            document.body.classList.add("modernAge");
            document.documentElement.style.setProperty('--theme-primary', '#027CAC');
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