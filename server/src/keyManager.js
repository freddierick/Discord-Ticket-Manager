const fs = require('fs');
const crypto = require('crypto');


//create RSA SHA256 Asynchronous keys
const generateKeyPair = () => new Promise((res) => {
    crypto.generateKeyPair('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        //   passphrase: process.env.SETTING_KEY_PASSPHRASE
        }
      }, (err, publicKey, privateKey) => {
        res({err, publicKey, privateKey});
      });
});

const getOrCreateKeys = async () => {
    const keys = {};

    try {
        console.log('Fetching RSA keys');
        keys.public = await fs.readFileSync(__dirname + '/keyStore/public.pem', 'utf8');
        keys.private = await fs.readFileSync(__dirname + '/keyStore/private.key', 'utf8');
        if (process.env.SETTING_NEW_KEYS_ON_REBOOT) {
            console.log('Setting new RSA keys rule: process.env.SETTING_NEW_KEYS_ON_REBOOT');
            const {publicKey, privateKey} = await generateKeyPair();
            keys.public = publicKey;
            keys.private = privateKey;
            await fs.writeFileSync(__dirname + '/keyStore/public.pem', keys.public);
            await fs.writeFileSync(__dirname + '/keyStore/private.key', keys.private);
        }
    } catch (err) {
        console.log('None found generating RSA keys');
        const {publicKey, privateKey} = await generateKeyPair();
        keys.public = publicKey;
        keys.private = privateKey;
        await fs.writeFileSync(__dirname + '/keyStore/public.pem', keys.public);
        await fs.writeFileSync(__dirname + '/keyStore/private.key', keys.private);
    };
    
    return keys;
};

module.exports = getOrCreateKeys;

