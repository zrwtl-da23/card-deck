import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Home({ initialDistributedCards = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        numberOfPeople: 0,
    });

    const [distributedCards, setDistributedCards] = useState(initialDistributedCards); // State for displaying results
    const [irregularityOccurred, setIrregularityOccurred] = useState(false);
    const totalCards = 52; //total cards

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission

        post(route('card.distribute'), { // Post to our new backend route
            onSuccess: (page) => {
                // If successfully returns data, update the display state
                setDistributedCards(page.props.distributedCards || []);
                
            },
            onError: (formErrors) => {
                // Handle errors if needed 
                console.error("Distribution error:", formErrors);
                setIrregularityOccurred(true);
                setDistributedCards([]);
            }
        });
    };

    // Format card names
    const formatCardDisplay = (cardString) => {
        if (!cardString || typeof cardString !== 'string') return ''; // Handle empty/invalid input
        const [suit, rank] = cardString.split('-');
        let fullSuit = '';
        let fullRank = '';

        switch (suit) {
            case 'S': fullSuit = 'Spade'; break;
            case 'H': fullSuit = 'Heart'; break;
            case 'D': fullSuit = 'Diamond'; break;
            case 'C': fullSuit = 'Club'; break;
            default: fullSuit = suit; // keep if no matched found
        }

        switch (rank) {
            case 'A': fullRank = 'Ace'; break;
            case 'X': fullRank = '10'; break;
            case 'J': fullRank = 'Jack'; break;
            case 'Q': fullRank = 'Queen'; break;
            case 'K': fullRank = 'King'; break;
            // case '0': fullRank = '10'; break; // Assuming '0' also means 10 if your backend uses it
            default: fullRank = rank; // Keep as is for 2-9
        }

        return { displayValue: `${fullSuit} ${fullRank}`, suit: suit };
    };

    return (
        <>
        <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Card Distributor" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Input Section */}
                            <form onSubmit={handleSubmit} className="mb-8 p-4 border-b border-gray-200">
                                <label htmlFor="numPeople" className="block text-lg font-medium text-gray-700 mb-2">
                                    Number of People:
                                </label>
                                <input
                                    type="number"
                                    id="numPeople"
                                    min="0"
                                    value={data.numberOfPeople}
                                    onChange={(e) => setData('numberOfPeople', parseInt(e.target.value) || 0)}
                                    className="block w-full max-w-xs p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="e.g., 4"
                                />
                                {errors.numberOfPeople && <div className="text-red-500 text-sm mt-1">{errors.numberOfPeople}</div>}
                                <button
                                    type="submit" // Changed to type="submit" for form
                                    disabled={processing} // Disable button while processing
                                    className="mt-4 px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {processing ? 'Distributing...' : 'Distribute Cards'}
                                </button>
                                <p className="text-sm text-gray-500 mt-2">
                                    Total cards available: {totalCards}.
                                </p>
                            </form>

                            {/* --- IRREGULARITY DISPLAY START --- */}
                            {irregularityOccurred && (
                                <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-md">
                                    <p className="font-bold">Irregularity occurred</p>
                                    <p>The process has been terminated due to an error in card distribution.</p>
                                    {/* Optionally display specific error details from `errors` object */}
                                    {errors.numberOfPeople && <p className="text-sm">{errors.numberOfPeople}</p>}
                                    {/* Add other specific error messages if your backend sends them */}
                                </div>
                            )}
                            {/* --- IRREGULARITY DISPLAY END --- */}

                            {/* Display Section */}
                            {!irregularityOccurred && distributedCards.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                        Cards Distributed to {data.numberOfPeople} People:
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {distributedCards.map((personCardsString, personIndex) => {
                                            // Split the string.
                                            const individualCardsArray = personCardsString.split(',');

                                            // Determine the true number of cards for this person
                                            const numberOfCardsForPerson =
                                                personCardsString === "" ||
                                                (individualCardsArray.length === 1 && individualCardsArray[0] === "")
                                                    ? 0 // If the string is empty, the count is 0
                                                    : individualCardsArray.length; // Otherwise, use the array's length

                                            const hasCardsToDisplay = numberOfCardsForPerson > 0;

                                            return (
                                                <div key={personIndex} className="bg-gray-50 p-4 rounded-lg shadow-md border border-gray-200">
                                                    <h4 className="font-medium text-lg text-gray-900 mb-3">
                                                        Person {personIndex + 1} ({numberOfCardsForPerson} cards)
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {hasCardsToDisplay ? (
                                                            individualCardsArray.map((cardValue, cardIndex) => {
                                                                // Final check: if an empty string somehow ends up as cardValue, don't render it
                                                                if (cardValue === "") {
                                                                    return null;
                                                                }

                                                                const { displayValue, suit } = formatCardDisplay(cardValue);
                                                                
                                                                // Define a unique color for each suit
                                                                let cardBgColor = '#ffffff'; //card background white
                                                                let cardTextColor = '';

                                                                switch (suit) {
                                                                    case 'H':
                                                                        cardTextColor = '#ef4444'; // Red for Hearts
                                                                        break;
                                                                    case 'D':
                                                                        cardTextColor = '#000000'; // Black for Diamonds
                                                                        break;
                                                                    case 'C':
                                                                        cardTextColor = '#22c55e'; // Green for Clubs
                                                                        break;
                                                                    case 'S':
                                                                        cardTextColor = '#0ea5e9'; // Blue for Spades
                                                                        break;
                                                                    default:
                                                                        cardTextColor = '#374151'; // Dark gray for default
                                                                        break;
                                                                }

                                                                return (
                                                                    <div
                                                                        key={`${personIndex}-${cardIndex}`}
                                                                        className="w-14 h-20 rounded-md shadow-sm flex flex-col items-center justify-center text-xs font-bold text-center border border-black"
                                                                        style={{ backgroundColor: cardBgColor, color: cardTextColor }}
                                                                    >
                                                                        {displayValue}
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <p className="text-gray-500 italic text-sm">No cards distributed.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <style>{`
            .bg-dots-darker {
                background-image: url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(0,0,0,0.07)'/%3E%3C/svg%3E");
            }
            @media (prefers-color-scheme: dark) {
                .dark\\:bg-dots-lighter {
                    background-image: url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(255,255,255,0.07)'/%3E%3C/svg%3E");
                }
            }
            `}</style>
        </>
    );
}
