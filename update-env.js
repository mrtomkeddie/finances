const { spawn } = require('child_process');

const vars = {
    'NEXT_PUBLIC_FIREBASE_API_KEY': 'AIzaSyDt3Qq8t5ezv3uFaxHSU0DVmR3l5WPPfT8',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': 'my-finance-app-ea016.firebaseapp.com',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID': 'my-finance-app-ea016',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': 'my-finance-app-ea016.firebasestorage.app',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': '792723261227',
    'NEXT_PUBLIC_FIREBASE_APP_ID': '1:792723261227:web:0eb9bfd8c48f9394f4276e',
    'NEXT_PUBLIC_EXCHANGE_RATE_API_KEY': 'eedda1b927dde2672c57e721'
};

const token = process.env.VERCEL_TOKEN;

async function updateEnv() {
    for (const [key, value] of Object.entries(vars)) {
        console.log(`Setting ${key}...`);
        // Remove first
        await new Promise(resolve => {
            const rm = spawn('npx.cmd', ['vercel', 'env', 'rm', key, 'production', '-y', '--token', token], { shell: true, stdio: 'ignore' });
            rm.on('close', resolve);
        });

        // Add via stdin
        await new Promise((resolve, reject) => {
            const p = spawn('npx.cmd', ['vercel', 'env', 'add', key, 'production', '--token', token], { shell: true });
            p.stdin.write(value);
            p.stdin.end(); // close stdin to signal EOF so Vercel takes the value

            p.stdout.on('data', d => process.stdout.write(d));
            p.stderr.on('data', d => process.stderr.write(d));

            p.on('close', code => {
                if (code === 0) resolve(); else reject(new Error(`Exit code ${code} for ${key}`));
            });
        });
    }
}

updateEnv().then(() => console.log('Done!')).catch(console.error);
