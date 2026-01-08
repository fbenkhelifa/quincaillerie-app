// Number to words in French
const unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const dizaines = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

function convertLessThanThousand(n) {
    if (n === 0) return '';
    
    let result = '';
    
    // Hundreds
    if (n >= 100) {
        if (Math.floor(n / 100) === 1) {
            result += 'cent';
        } else {
            result += unites[Math.floor(n / 100)] + ' cent';
        }
        n %= 100;
        if (n > 0) result += ' ';
    }
    
    // Tens and units
    if (n >= 20) {
        const dizaine = Math.floor(n / 10);
        const unite = n % 10;
        
        if (dizaine === 7 || dizaine === 9) {
            // 70s and 90s
            result += dizaines[dizaine];
            if (unite === 1 && dizaine === 7) {
                result += ' et onze';
            } else {
                result += '-' + unites[10 + unite];
            }
        } else {
            result += dizaines[dizaine];
            if (unite === 1 && dizaine !== 8) {
                result += ' et un';
            } else if (unite > 0) {
                result += '-' + unites[unite];
            } else if (dizaine === 8) {
                result += 's';
            }
        }
    } else if (n > 0) {
        result += unites[n];
    }
    
    return result;
}

export function numberToWordsFR(amount) {
    if (amount === 0) return 'zéro';
    
    const intPart = Math.floor(amount);
    const decPart = Math.round((amount - intPart) * 100);
    
    let result = '';
    
    if (intPart === 0) {
        result = 'zéro';
    } else if (intPart === 1) {
        result = 'un';
    } else {
        // Millions
        if (intPart >= 1000000) {
            const millions = Math.floor(intPart / 1000000);
            if (millions === 1) {
                result += 'un million';
            } else {
                result += convertLessThanThousand(millions) + ' millions';
            }
            const remainder = intPart % 1000000;
            if (remainder > 0) result += ' ';
        }
        
        // Thousands
        const afterMillions = intPart % 1000000;
        if (afterMillions >= 1000) {
            const thousands = Math.floor(afterMillions / 1000);
            if (thousands === 1) {
                result += 'mille';
            } else {
                result += convertLessThanThousand(thousands) + ' mille';
            }
            const remainder = afterMillions % 1000;
            if (remainder > 0) result += ' ';
        }
        
        // Less than thousand
        const lessThanThousand = intPart % 1000;
        if (lessThanThousand > 0) {
            result += convertLessThanThousand(lessThanThousand);
        }
    }
    
    result += ' dinars';
    
    if (decPart > 0) {
        result += ' et ' + convertLessThanThousand(decPart) + ' centimes';
    }
    
    return result.charAt(0).toUpperCase() + result.slice(1);
}

// Number to words in Arabic
const arabicUnits = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
const arabicTens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const arabicHundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

export function numberToWordsAR(amount) {
    const intPart = Math.floor(amount);
    const decPart = Math.round((amount - intPart) * 100);
    
    if (intPart === 0) return 'صفر دينار';
    
    let result = '';
    
    if (intPart >= 1000) {
        const thousands = Math.floor(intPart / 1000);
        if (thousands === 1) {
            result += 'ألف';
        } else if (thousands === 2) {
            result += 'ألفان';
        } else if (thousands <= 10) {
            result += arabicUnits[thousands] + ' آلاف';
        } else {
            result += thousands + ' ألف';
        }
        result += ' و';
    }
    
    const remainder = intPart % 1000;
    if (remainder >= 100) {
        result += arabicHundreds[Math.floor(remainder / 100)] + ' و';
    }
    
    const tens = remainder % 100;
    if (tens >= 11 && tens <= 19) {
        result += arabicUnits[tens - 10] + ' عشر';
    } else {
        if (tens % 10 > 0) {
            result += arabicUnits[tens % 10];
            if (tens >= 20) result += ' و';
        }
        if (tens >= 20) {
            result += arabicTens[Math.floor(tens / 10)];
        } else if (tens === 10) {
            result += 'عشرة';
        }
    }
    
    result = result.replace(/ و$/, '');
    result += ' دينار';
    
    if (decPart > 0) {
        result += ' و ' + decPart + ' سنتيم';
    }
    
    return result;
}
