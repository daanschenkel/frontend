import Head from "next/head";
import {useRouter} from "next/router";
import AppNav from "../../../components/navbar/app";
import {useEffect} from "react";
import * as api from "../../../utils/api";
import {getCookie} from 'cookies-next';
import LoadingPage from "../../../components/app/loading-page";
import {UserSocket} from "../../../utils/ws/userSocket";

function AtMe_Index({token, dataProps}) {
    const router = useRouter();
    const {state: appReady, stateSetter: setAppReady} = dataProps.appReady
    const {state: userData, stateSetter: setUserData} = dataProps.userData

    useEffect(() => {
        (async () => {
            try {
                const WS = new UserSocket(token, '1', 'json')
                const userData = await WS.connect();

                setUserData(userData);
                setAppReady(true);
            } catch (e) {
                console.log("Error: ");
                setAppReady(false);
                console.log(e)
                if (e.message === 'Invalid token') {
                    router.push('/app/logout?redirect=/login')
                } else {
                    router.push('/app/logout');
                }
            }
        })();
    }, [])

    return (
        <>
            <Head>
                <title>Kastel App</title>
            </Head>

            {appReady ? (
                <>
                    <AppNav userInfo={userData}>

                        {/* page content goes inside here */}

                    </AppNav>
                </>
            ) : (
                <LoadingPage user={userData} token={token} appReady={appReady}/>
            )}

        </>
    )
}

export const getServerSideProps = ({req, res}) => {
    let token = getCookie('token', {req, res}) || null;

    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        }
    }

    return {
        props: {
            token: getCookie('token', {req, res}) || null
        }
    };
};

export default AtMe_Index;