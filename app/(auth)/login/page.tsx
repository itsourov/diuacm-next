import { Suspense } from 'react';
import LoginContent from './LoginContent';
import LoginLoading from './loading';

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginLoading />}>
            <LoginContent />
        </Suspense>
    );
}