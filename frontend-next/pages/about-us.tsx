
import HeaderAndNav from '../components/HeaderAndNav';
import { useRouter } from 'next/router';

export default function AboutUs() {
    const router = useRouter();

    return (
        <div>
            <HeaderAndNav username={null} />
            <div id="description">
                <p>This is a project written in Spring 2024 for CS 347 (Advanced Software Design) at Carleton College in Northfield, MN.</p>
                <p>The team was:</p>
                <ul>
                    <li>Frontend: Cece Che Tita & Gisele Nelson</li>
                    <li>Game Logic and AI Players: Willow Gu & Josh Meier</li>
                    <li>Backend/Database: Kendra Winhall & Ryan Dunn</li>
                </ul>
                <p>For more information about the project, including our source code and how to run it, see our <a href="https://github.com/GiseleN523/CS347-ShippingHazards" target="_blank" rel="noreferrer">Github page</a>.</p>
            </div>
        </div>
    );
}
