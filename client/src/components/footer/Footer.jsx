import { Link } from 'react-router-dom';

function Footer() {
    return (
        <div>
            {/* Footer */}
            <footer className="bg-muted py-8 md:py-12">
                <div className="container mx-auto flex flex-col items-center justify-between gap-8 px-4 md:flex-row">
                    <div className="flex items-center gap-2">
                        <PawPrintIcon className="h-8 w-8 text-primary" />
                        <span className="text-xl font-bold">宠物帮</span>
                    </div>
                    <div className='flex justify-center'>
                        {/* <a href="/list" className='px-8'>查找护理需求</a>
                        <a href="/add" className='px-8'>发布护理需求</a> */}
                        {/* <a href="" className='px-8'>Become a Caretaker</a> */}
                    </div>
                    <nav className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href="#" aria-label="Facebook" prefetch={false}>
                            <FacebookIcon className="h-6 w-6 text-muted-foreground hover:text-primary" />
                        </Link>
                        <Link href="#" aria-label="Twitter" prefetch={false}>
                            <TwitterIcon className="h-6 w-6 text-muted-foreground hover:text-primary" />
                        </Link>
                        <Link href="#" aria-label="Instagram" prefetch={false}>
                            <InstagramIcon className="h-6 w-6 text-muted-foreground hover:text-primary" />
                        </Link>
                    </div>
                </div>
                <div className="mt-8 text-center text-sm text-muted-foreground">&copy; 2025 宠物护理中心. 保留所有权利.</div>
            </footer>
        </div>
    )
}

function FacebookIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
    )
}

function InstagramIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
    );
}

function PawPrintIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="4" r="2" />
            <circle cx="18" cy="8" r="2" />
            <circle cx="20" cy="16" r="2" />
            <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
        </svg>
    )
}

function TwitterIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
    )
}

export default Footer;