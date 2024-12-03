export function lightDarkMode(colorTheme:string) {
    if(colorTheme === 'dark'){
        document.body.classList.add("sheet-darkmode");
    } else {
        document.body.classList.remove("sheet-darkmode");
    }
}