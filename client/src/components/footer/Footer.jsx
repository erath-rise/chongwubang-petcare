

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
                </div>
                <div className="mt-8 text-center text-sm text-muted-foreground">&copy; 2025 宠物帮. 保留所有权利.</div>
            </footer>
        </div>
    )
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

export default Footer;