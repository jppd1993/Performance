// pages/_app.js
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css'; // ถ้ามี CSS ที่เป็น global


function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />;
}

export default MyApp;
