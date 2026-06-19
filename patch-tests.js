const fs = require('fs');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walk('./apps/api/src');
files.forEach(file => {
    if (!file.includes('.spec.ts') && !file.includes('.int-spec.ts')) return;
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    function replaceCalls(className) {
        let keyword = `new ${className}(`;
        let index = content.indexOf(keyword);
        while (index !== -1) {
            let pCount = 1;
            let i = index + keyword.length;
            while (i < content.length && pCount > 0) {
                if (content[i] === '(') pCount++;
                if (content[i] === ')') pCount--;
                i++;
            }
            if (pCount === 0) {
                let before = content.substring(0, i - 1);
                let after = content.substring(i - 1);
                
                if (!before.endsWith(', { createNotification: jest.fn() } as never')) {
                    content = before + ', { createNotification: jest.fn() } as never' + after;
                    // Adjust i because content length increased
                    i += ', { createNotification: jest.fn() } as never'.length;
                }
            }
            index = content.indexOf(keyword, i);
        }
    }
    
    replaceCalls('BookingsService');
    replaceCalls('PaymentsService');
    
    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
