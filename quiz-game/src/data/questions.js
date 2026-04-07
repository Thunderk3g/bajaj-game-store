// Quiz questions data - 5 GST-related questions
export const quizQuestions = [
        {
                id: 1,
                category: 'GST',
                difficulty: 'medium',
                question: 'What is the current GST rate applicable on Life Insurance premiums in India?',
                options: [
                        '5%',
                        '0% (Exempt)',
                        '12%',
                        '18%'
                ],
                correctAnswer: '0% (Exempt)',
                explanation: 'In a landmark decision, the Government of India exempted Life Insurance premiums from GST (0% GST), making life insurance more affordable for customers. This exemption applies to all types of life insurance policies including term, ULIP, endowment, and pension plans.'
        },
        {
                id: 2,
                category: 'GST',
                difficulty: 'medium',
                question: 'Which of the following can benefit from the 0% GST exemption on life insurance?',
                options: [
                        'Only individuals buying term insurance',
                        'Only salaried employees',
                        'All customers buying any type of life insurance (term, ULIP, endowment, pension)',
                        'Only customers above 40 years of age'
                ],
                correctAnswer: 'All customers buying any type of life insurance (term, ULIP, endowment, pension)',
                explanation: 'The 0% GST exemption applies universally to all types of life insurance products—term insurance, ULIP, endowment plans, traditional savings products, annuities, and pension plans.'
        },
        {
                id: 3,
                category: 'GST',
                difficulty: 'easy',
                question: 'How does the 0% GST impact life insurance premiums for customers?',
                options: [
                        'Premiums have increased by 18%',
                        'Premiums remain unchanged',
                        'Premiums have become more affordable for customers',
                        'Premiums are now completely free'
                ],
                correctAnswer: 'Premiums have become more affordable for customers',
                explanation: 'With 0% GST, insurance companies have reduced their premiums, making life insurance more accessible and affordable. Customers pay lower premiums, and the savings translate directly to cheaper life insurance coverage.'
        },
        {
                id: 4,
                category: 'GST',
                difficulty: 'easy',
                question: 'Does the 0% GST exemption apply to riders attached to life insurance policies?',
                options: [
                        'Yes, all riders are also 0% GST',
                        'No, riders still attract 18% GST',
                        'Only critical illness riders are 0% GST',
                        'It depends on the insurance company'
                ],
                correctAnswer: 'Yes, all riders are also 0% GST',
                explanation: 'The 0% GST exemption extends to all riders (additional coverages) attached to life insurance policies, such as critical illness rider, accidental death benefit rider, disability rider, and waiver of premium rider. This makes comprehensive protection even more affordable.'
        },
        {
                id: 5,
                category: 'GST',
                difficulty: 'medium',
                question: 'If ₹1Cr term insurance cost ₹1000/month with GST, and now GST is removed, will your premium be higher or lower?',
                options: [
                        'Lower',
                        'Higher'
                ],
                correctAnswer: 'Lower',
                explanation: 'GST exemption directly reduces your premium. More money stays in your pocket each month!'
        },
        {
                id: 6,
                category: 'GST',
                difficulty: 'medium',
                question: 'You add a "Critical Illness Rider" to your term plan. Does it also get 0% GST?',
                options: [
                        'Yes, rider is also 0% GST',
                        'No, riders still have GST'
                ],
                correctAnswer: 'Yes, rider is also 0% GST',
                explanation: 'Every rider (critical illness, accidental death, disability) is also GST-free! Your complete protection package costs less.'
        },
        {
                id: 7,
                category: 'GST',
                difficulty: 'medium',
                question: 'Does the 0% GST benefit apply only to term insurance, or also to ULIPs and pension plans?',
                options: [
                        'Only term insurance gets 0% GST',
                        'All types (term, ULIP, pension) get 0% GST'
                ],
                correctAnswer: 'All types (term, ULIP, pension) get 0% GST',
                explanation: 'The exemption covers ALL life insurance products: term insurance, ULIPs, endowment plans, traditional savings plans, annuities, and pension plans. One rule benefits all!'
        },
        {
                id: 8,
                category: 'GST',
                difficulty: 'medium',
                question: 'If GST on term insurance becomes 0%, what happens to premiums?',
                options: [
                        'Premiums increase',
                        'Premiums remain the same',
                        'Premiums become cheaper',
                        'Premiums are refunded yearly'
                ],
                correctAnswer: 'Premiums become cheaper',
                explanation: 'With 0% GST, insurance companies have reduced their premiums, making life insurance more accessible and affordable.'
        },
        {
                id: 9,
                category: 'GST',
                difficulty: 'medium',
                question: 'If GST is removed, who benefits the most?',
                options: [
                        'Insurance companies',
                        'Government',
                        'Customers buying protection',
                        'Stock market investors'
                ],
                correctAnswer: 'Customers buying protection',
                explanation: 'With 0% GST, insurance companies have reduced their premiums, making life insurance more accessible and affordable.'
        },
        {
                id: 10,
                category: 'GST',
                difficulty: 'medium',
                question: 'GST on life insurance impacts which part most?',
                options: [
                        'Policy term',
                        'Sum assured',
                        'Premium payable',
                        'Claim settlement time'
                ],
                correctAnswer: 'Premium payable',
                explanation: 'The GST reduction directly reduces the premium amount.'
        },
        {
                id: 11,
                category: 'GST',
                difficulty: 'easy',
                question: 'What do you think GST is?',
                options: [
                        'General Service Tax',
                        'Government Sales Tax',
                        'Government Service Tax',
                        'Goods and Services Tax'
                ],
                correctAnswer: 'Goods and Services Tax',
                explanation: 'GST stands for Goods and Services Tax.'
        }
];

// Shuffle array utility function
export const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
};

// Get shuffled questions with shuffled options
export const getShuffledQuestions = () => {
        const shuffledQuestions = shuffleArray(quizQuestions).slice(0, 5);
        return shuffledQuestions.map(q => ({
                ...q,
                options: shuffleArray(q.options)
        }));
};

export default quizQuestions;
