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
                document.documentElement.style.setProperty('--theme-secondary','#e9fff8');
            } else if(args?.technofantasy){
                document.documentElement.style.setProperty('--theme-primary', '#9d3916');
                document.documentElement.style.setProperty('--theme-secondary','#fff2ed');
            } else {
                document.documentElement.style.setProperty('--theme-primary', '#1e4e7a');
                document.documentElement.style.setProperty('--theme-secondary','#ecf6ff');
            }
        break;
        case 'mage':
            document.body.classList.add("modernAge");
            if(args?.cyberpunk){
                document.documentElement.style.setProperty('--theme-primary', '#9f0058');
                document.documentElement.style.setProperty('--theme-secondary','#fef8fb');
            }else {
                document.documentElement.style.setProperty('--theme-primary', '#027CAC');
                document.documentElement.style.setProperty('--theme-secondary','#ecf6ff');
            }
        break;
        case 'blue rose':
            document.body.classList.add("bluerose");
            document.documentElement.style.setProperty('--theme-primary', '#007bba');
            document.documentElement.style.setProperty('--theme-secondary','#ecf6ff');
        break;
        case 'cthulhu':
            document.body.classList.add("cthulhu");
            document.documentElement.style.setProperty('--theme-primary', '#1D3729');
            document.documentElement.style.setProperty('--theme-secondary','#e9fff8');
        break;
      }
}