<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CardController extends Controller
{
    public function distribute(Request $request){
        $numOfPeople = $request->input('numberOfPeople');

        // --- Testing purpose - for irregularity occurance---
        // $request->validate([
        //     'numberOfPeople' => ['required', 'integer', 'min:1', 'max:5'], // Set max to 5 for easy testing
        // ]);
        // --- Testing purpose ---

        //validate input is numerical and more than 0
        if(!is_numeric($numOfPeople) || $numOfPeople <= 0){ 
            return response()->json([
                'success' => false,
                'message' => "Please enter a valid input."
            ], 400);
        }

        //define cards
        $cards = [];
        $suits = ['S', 'H', 'D', 'C']; //S - Spade, H - Hearts, D - Diamond, C - Club
        $ranks = [
            1 => 'A',
            10 => 'X',
            11 => 'J',
            12 => 'Q',
            13 => 'K'
        ];

        //build deck
        foreach ($suits as $suit) {
            for ($i=1; $i <= 13; $i++) { 
                $label = $ranks[$i] ?? $i; //If 1, 10, 11, 12, 13 value based on defined
                $cards[] = "$suit-$label";
            }
        }

        //shuffle the cards
        $shuffle = shuffle($cards);
        if($shuffle == false){ 
            return response()->json([
                'success' => false,
                'message' => "An error occured. Please try again."
            ], 400);
        }

        $people = array_fill(0, $numOfPeople, []);

        foreach ($cards as $n => $card) {
            $person = $n % $numOfPeople;
            $people[$person][] = $card;
        }

        $distributedCards = array_map(function ($hand){
            return implode(',', $hand);
        }, $people);

        return Inertia::render('Home', [
            'distributedCards' => $distributedCards,
            'numberOfPeople' => $numOfPeople,
        ]);
    }
}
