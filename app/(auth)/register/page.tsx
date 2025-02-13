import { Suspense } from 'react';
import RegisterLoading from './loading';
import RegisterContent from './RegisterContent';

export default function RegisterPage() {
    return (
        <Suspense fallback={<RegisterLoading />}>
            <RegisterContent />
        </Suspense>
    );
}