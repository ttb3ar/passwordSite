// Theme handling
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    if (document.documentElement.getAttribute('data-theme') === 'light') {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

// Character sets
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';

function generatePassword(minLength, maxLength, useSpecialChars, specialCharsList, 
                        useNumbers, allowCapitalLetters, noConsecutiveRepeats, 
                        ensureOneOfEach, excludeChars) {
    // Initialize character set with lowercase letters
    let characters = LOWERCASE;
    let password = [];
    
    // Add other character sets based on options
    if (allowCapitalLetters) characters += UPPERCASE;
    if (useNumbers) characters += NUMBERS;
    if (useSpecialChars) characters += specialCharsList;
    
    // Remove excluded characters from the character set
    if (excludeChars) {
        characters = characters.split('')
            .filter(char => !excludeChars.includes(char))
            .join('');
            
        // Check if we have enough characters left to generate a password
        if (characters.length === 0) {
            throw new Error('All characters have been excluded. Cannot generate password.');
        }
    }
    
    // Random length between min and max
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    
    // Ensure one of each type if requested
    if (ensureOneOfEach) {
        if (allowCapitalLetters) {
            const availableUppercase = UPPERCASE.split('')
                .filter(char => !excludeChars?.includes(char));
            if (availableUppercase.length > 0) {
                password.push(availableUppercase[Math.floor(Math.random() * availableUppercase.length)]);
            }
        }
        if (useNumbers) {
            const availableNumbers = NUMBERS.split('')
                .filter(char => !excludeChars?.includes(char));
            if (availableNumbers.length > 0) {
                password.push(availableNumbers[Math.floor(Math.random() * availableNumbers.length)]);
            }
        }
        if (useSpecialChars) {
            const availableSpecial = specialCharsList.split('')
                .filter(char => !excludeChars?.includes(char));
            if (availableSpecial.length > 0) {
                password.push(availableSpecial[Math.floor(Math.random() * availableSpecial.length)]);
            }
        }
    }
    
    // Generate remaining characters
    while (password.length < length) {
        const char = characters[Math.floor(Math.random() * characters.length)];
        
        // Check for consecutive repeats if not allowed
        if (noConsecutiveRepeats && password.length > 0 && char === password[password.length - 1]) {
            continue;
        }
        
        password.push(char);
    }
    
    // Shuffle the password array
    for (let i = password.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [password[i], password[j]] = [password[j], password[i]];
    }
    
    return password.join('');
}

// UI Event Handlers
document.addEventListener('DOMContentLoaded', () => {
    // Theme initialization
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    const themeToggle = document.getElementById('checkbox');
    themeToggle.checked = savedTheme === 'dark';
    
    // Theme toggle event listener
    themeToggle.addEventListener('change', toggleTheme);

    // Password generator initialization
    const generateBtn = document.getElementById('generateBtn');
    const specialCharsCheckbox = document.getElementById('specialChars');
    const specialCharsInput = document.getElementById('specialCharsInput');
    
    // Toggle special characters input visibility
    specialCharsCheckbox.addEventListener('change', () => {
        specialCharsInput.style.display = specialCharsCheckbox.checked ? 'block' : 'none';
    });
    
    generateBtn.addEventListener('click', () => {
        const minLength = parseInt(document.getElementById('minLength').value);
        const maxLength = parseInt(document.getElementById('maxLength').value);
        const useSpecialChars = document.getElementById('specialChars').checked;
        const specialCharsList = document.getElementById('specialCharsList').value;
        const useNumbers = document.getElementById('numbers').checked;
        const allowCapitalLetters = document.getElementById('capital').checked;
        const noConsecutiveRepeats = document.getElementById('noRepeats').checked;
        const ensureOneOfEach = document.getElementById('ensureOne').checked;
        const numPasswords = parseInt(document.getElementById('numPasswords').value);
        const excludeChars = document.getElementById('excludeChars').value;
        
        // Validate inputs
        if (minLength > maxLength) {
            alert('Minimum length cannot be greater than maximum length');
            return;
        }
        
        const passwordsList = document.getElementById('passwordsList');
        passwordsList.innerHTML = '';
        
        try {
            // Generate passwords
            for (let i = 0; i < numPasswords; i++) {
                const password = generatePassword(
                    minLength, maxLength, useSpecialChars, specialCharsList,
                    useNumbers, allowCapitalLetters, noConsecutiveRepeats,
                    ensureOneOfEach, excludeChars
                );
                
                // Create password item with copy button
                const passwordItem = document.createElement('div');
                passwordItem.className = 'password-item';
                
                // Use textContent to safely display the password
                const passwordText = document.createElement('span');
                passwordText.textContent = `${i + 1}. ${password}`;
                passwordItem.appendChild(passwordText);
                
                // Create the copy button and append it
                const copyButton = document.createElement('button');
                copyButton.textContent = 'Copy';
                copyButton.onclick = () => copyToClipboard(password, copyButton);
                passwordItem.appendChild(copyButton);
                
                // Append the password item to the list
                passwordsList.appendChild(passwordItem);
            }
            
            // Show results
            document.getElementById('results').classList.add('show');
        } catch (error) {
            alert(error.message);
        }
    });
});

// Updated copy to clipboard function with button state feedback
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.disabled = true;
        
        // Reset button after 1.5 seconds
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy password:', err);
        button.textContent = 'Error';
        
        // Reset button after 1.5 seconds
        setTimeout(() => {
            button.textContent = 'Copy';
            button.disabled = false;
        }, 1500);
    });
}
