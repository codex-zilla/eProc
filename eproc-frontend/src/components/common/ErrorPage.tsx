import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
    code: string | number;
    title: string;
    description: string;
    codeColor?: string;
}

/**
 * Shared full-page error display for 403/404 and similar HTTP error pages.
 * Replaces the previous duplicated NotAuthorized/NotFound implementations.
 */
export function ErrorPage({
    code,
    title,
    description,
    codeColor = 'text-slate-200',
}: ErrorPageProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center px-6">
                <h1 className={`text-9xl font-bold ${codeColor}`}>{code}</h1>
                <h2 className="text-lg md:text-2xl font-semibold text-slate-900 mt-4">
                    {title}
                </h2>
                <p className="text-slate-500 mt-2 text-sm sm:text-base">{description}</p>
                <Button
                    asChild
                    className="mt-8 bg-[#2a3455] hover:bg-[#1e253e] text-white px-6"
                >
                    <Link to="/">Go Home</Link>
                </Button>
            </div>
        </div>
    );
}
