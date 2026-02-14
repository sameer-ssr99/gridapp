export default {
    plugins: {
        '@tailwindcss/postcss': {},
        autoprefixer: {}, // autoprefixer is actually included in the v4 plugin usually but let's keep it if needed or remove it. 
        // Docs say: "The @tailwindcss/postcss plugin includes Autoprefixer..." so we can remove it.
    },
}
