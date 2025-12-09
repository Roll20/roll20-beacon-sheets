import { lightDarkMode } from './darkMode';

export function productLineStyle(gameSystem:string,lightDark:string,args?:any){
    document.body.className = '';
    lightDarkMode(lightDark);
    switch(gameSystem){
        case 'fage1e':
        case 'fage2e':            
            document.body.classList.add('fantasyAge');
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
            document.body.classList.add('modernAge');
            if(args?.cyberpunk){
                document.documentElement.style.setProperty('--theme-primary', '#9f0058');
                document.documentElement.style.setProperty('--theme-secondary','#fef8fb');
            }else {
                document.documentElement.style.setProperty('--theme-primary', '#027CAC');
                document.documentElement.style.setProperty('--theme-secondary','#ecf6ff');
            }
        break;
        case 'blue rose':
            document.body.classList.add('bluerose');
            document.documentElement.style.setProperty('--theme-primary', '#007bba');
            document.documentElement.style.setProperty('--theme-secondary','#ecf6ff');
        break;
        case 'cthulhu':
            document.body.classList.add('cthulhu');
            document.documentElement.style.setProperty('--theme-primary', '#1D3729');
            document.documentElement.style.setProperty('--theme-secondary','#e9fff8');
        break;
        case 'expanse':
            document.body.classList.add('expanse');
            // document.documentElement.style.setProperty('--theme-secondary','#ecf6ff');
            switch(args?.originFaction){
                case 'earth':
                    document.body.classList.add('earth');
                    document.body.classList.remove('mars','belters','union');
                    document.documentElement.style.setProperty('--theme-primary', '#00577B');
                    document.documentElement.style.setProperty('--theme-secondary','#f5fcff');
                break;
                case 'mars':
                    document.body.classList.add('mars');
                    document.body.classList.remove('earth','belters','union');
                    document.documentElement.style.setProperty('--theme-primary', '#A00C11');
                    document.documentElement.style.setProperty('--theme-secondary','#fffafb');
                break;
                case 'belters':
                    document.body.classList.add('belters');
                    document.body.classList.remove('earth','mars','union');
                    document.documentElement.style.setProperty('--theme-primary', '#000');
                    document.documentElement.style.setProperty('--theme-secondary','#ffffff');
                break;
                case 'transportUnion':
                    document.body.classList.add('union');
                    document.body.classList.remove('mars','belters','earth');
                    document.documentElement.style.setProperty('--theme-primary', '#00837c');
                    document.documentElement.style.setProperty('--theme-secondary','#f5fcff');
                break;
                // orange
                // case 'belters':
                //     document.body.classList.add('belters');
                //     document.body.classList.remove('earth','mars','outers');
                //     document.documentElement.style.setProperty('--theme-primary', '#C93B1C');
                //     document.documentElement.style.setProperty('--theme-secondary','#ffd1c6');
                // break;
                // purple
                // case 'outers':
                //     document.body.classList.add('outers');
                //     document.body.classList.remove('earth','belters','mars');
                //     document.documentElement.style.setProperty('--theme-primary', '#682E4D');
                //     document.documentElement.style.setProperty('--theme-secondary','#fff8fc');
                // break;
                default:
                    document.body.classList.remove('earth','belters','mars', 'union');
                    document.documentElement.style.setProperty('--theme-primary', '#00577B');
                    document.documentElement.style.setProperty('--theme-secondary','#f5fcff');
                break;
            }
        break;
      }
}