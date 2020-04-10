// should be new by ./setup/setup.js to new.js
module.exports.config = {
    version: '0.9.8',
    default: true,
    session: {
        secret: "Goethe"
    },
    key: "Einstein",
    mongo: {
        host: 'mongodb://localhost:27017',
        db: 'onesmallstep'
    },
    ssl: {
        active: false,
        key: '/Users/me/ssl/root.key',
        cert: '/Users/me/ssl/root.pem'
    },
    theme: {
        name: 'default',
        currency: '$',
        LC_ALL:  'en_GB.UTF-8' //z.b: 'de_DE.UTF-8'
    }
};
