import React, { useState } from 'react';
import { AnswerAnalysis, TopicQA } from '../types';
import { analyzeUserAnswer, generatePersonalizedTopicQa } from '../services/geminiService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { SunIcon, HeartIcon, MapPinIcon, UserGroupIcon, ShoppingBagIcon, CalendarDaysIcon, MicrophoneIcon, SparklesIcon, CheckCircleIcon, LightbulbIcon, TicketIcon, BeakerIcon, HomeIcon, PhoneIcon, PhotoIcon, AcademicCapIcon, TrophyIcon, SpeakerWaveIcon, BookOpenIcon } from './IconComponents';

interface TopicModule {
  topic: string;
  icon: React.FC<{ className?: string }>;
  isPersonalized: boolean;
  promptText?: string;
  inputPlaceholder?: string;
  questions?: TopicQA[];
}

const practiceModules: TopicModule[] = [
  {
    topic: 'Family',
    icon: UserGroupIcon,
    isPersonalized: false,
    questions: [
        { question: 'Can you tell me about your family?', answer: 'Yes, of course. I have a small family. It is just my husband and me. We live together in a flat. My parents live in another city, but we visit them often.' },
        { question: 'What do you like to do with your family?', answer: 'I like to cook with my husband on the weekends. We also enjoy watching movies together. When we visit my parents, we often go for a walk.' }
    ]
  },
  {
    topic: 'Hobbies',
    icon: SparklesIcon,
    isPersonalized: false,
    questions: [
        { question: 'What do you do in your free time?', answer: 'In my free time, I enjoy reading books and listening to music. It is very relaxing. Sometimes, I also go for a walk if the weather is nice.' },
        { question: 'Do you play any sports?', answer: 'I don\'t play sports regularly, but I like to swim in the summer. There is a public swimming pool not far from my home that I like to visit.' }
    ]
  },
  {
    topic: 'Daily Routine',
    icon: CalendarDaysIcon,
    isPersonalized: false,
    questions: [
        { question: 'What do you usually do in the morning?', answer: 'In the morning, I usually wake up at 7 AM. I have a shower, get dressed, and then I have breakfast. I usually have toast and a cup of tea.' },
        { question: 'What time do you usually go to bed?', answer: 'I usually go to bed at about 11 PM. Before I go to sleep, I like to read a book for about 30 minutes. It helps me to relax.' }
    ]
  },
  {
    topic: 'Food',
    icon: HeartIcon,
    isPersonalized: false,
    questions: [
        { question: 'What is your favourite food?', answer: 'My favourite food is pizza. I especially like it with cheese and tomato. I often eat it on Friday evenings with my family.' },
        { question: 'Do you like cooking?', answer: 'Yes, I enjoy cooking. I usually cook dinner every day. My favourite thing to make is pasta with a vegetable sauce.' }
    ]
  },
   {
    topic: 'Weather',
    icon: SunIcon,
    isPersonalized: false,
    questions: [
        { question: 'What is the weather like today?', answer: 'It is sunny and warm today. There isn\'t a cloud in the sky. It is a beautiful day.' },
        { question: 'What is your favourite type of weather?', answer: 'I like when it is warm and sunny because I can go outside and enjoy a walk in the park. I do not like the rain very much.' }
    ]
  },
  {
    topic: 'Transport',
    icon: TicketIcon,
    isPersonalized: false,
    questions: [
      { question: "How do you usually travel around your city?", answer: "I usually travel by bus. The bus stop is very close to my house, and it is very convenient. Sometimes, if I am in a hurry, I take a taxi." },
      { question: "What is public transport like where you live?", answer: "The public transport is quite good. The buses are regular, but they can be crowded in the morning. We also have a train station, which is useful for longer journeys." },
    ]
  },
  {
    topic: 'Doctor\'s Appointment',
    icon: BeakerIcon,
    isPersonalized: false,
    questions: [
      { question: "Why might someone need to see a doctor?", answer: "Someone might see a doctor if they feel sick, like if they have a fever or a bad cough. Also, for regular check-ups or if they have an injury." },
      { question: "How do you make a doctor's appointment in your country?", answer: "In my country, you usually have to call the doctor's office, which is called a surgery. You tell the receptionist your name and why you need to see the doctor, and she gives you a time." },
    ]
  },
  {
    topic: 'Visiting People',
    icon: HomeIcon,
    isPersonalized: false,
    questions: [
      { question: "Do you prefer to visit friends at their home, or meet them outside?", answer: "I prefer to visit my friends at their home. It is more comfortable and we can talk easily. Sometimes we cook a meal together, which is very nice." },
      { question: "What do you usually do when you visit your family?", answer: "When I visit my family, we usually have a big meal together and talk for a long time. We like to catch up on each other's news. My mother is a very good cook." },
    ]
  },
  {
    topic: 'Customer Service',
    icon: PhoneIcon,
    isPersonalized: false,
    questions: [
      { question: "Imagine you bought a new kettle and it is broken. What would you do?", answer: "I would take the kettle back to the shop with the receipt. I would explain to the customer service desk that it does not work and ask for a refund or a new kettle." },
      { question: "Have you ever called a company for help? Why?", answer: "Yes, I called my internet company last month because my internet was not working. I had to wait for a while, but the person on the phone was helpful and fixed the problem." },
    ]
  },
  {
    topic: 'Holidays & Travel',
    icon: PhotoIcon,
    isPersonalized: false,
    questions: [
        { question: 'Where did you go for your last holiday?', answer: 'For my last holiday, I went to Spain with my family. We stayed in a hotel near the beach. The weather was lovely and warm.' },
        { question: 'What do you like to do when you are on holiday?', answer: 'When I am on holiday, I like to relax on the beach and swim in the sea. I also enjoy trying the local food and visiting interesting places.' }
    ]
  },
  {
    topic: 'Work & Jobs',
    icon: AcademicCapIcon,
    isPersonalized: false,
    questions: [
        { question: 'Do you have a job? What do you do?', answer: 'Yes, I work in a shop. I am a sales assistant. I help customers and I work at the cash desk.' },
        { question: 'What do you like about your job?', answer: 'I like my job because I enjoy talking to people. My colleagues are also very friendly, which is nice.' }
    ]
  },
  {
    topic: 'School & Studies',
    icon: AcademicCapIcon,
    isPersonalized: false,
    questions: [
        { question: 'Are you a student?', answer: 'Yes, I am. I am studying English at a language school. I have classes three times a week.' },
        { question: 'What is your favourite subject?', answer: 'My favourite subject is speaking because I like to practice talking with my classmates and the teacher. It is difficult but fun.' }
    ]
  },
  {
    topic: 'Your Home',
    icon: HomeIcon,
    isPersonalized: false,
    questions: [
        { question: 'Do you live in a house or a flat?', answer: 'I live in a flat on the second floor. It is not very big, but it is comfortable. It has two bedrooms, a living room, a kitchen, and a bathroom.' },
        { question: 'What is your favourite room in your home?', answer: 'My favourite room is the living room. It has a comfortable sofa and a big window, so it is very bright. I like to relax there in the evening.' }
    ]
  },
  {
    topic: 'Hometown',
    icon: MapPinIcon,
    isPersonalized: false,
    questions: [
        { question: 'Can you describe your hometown?', answer: 'My hometown is a small city. It has a beautiful old centre with a big market square. There are many shops and cafes, and there is also a nice park.' },
        { question: 'What is your favourite place in your hometown?', answer: 'My favourite place is the park. It is very big and has a lovely lake. I often go there for a walk on weekends.' }
    ]
  },
  {
    topic: 'Shopping',
    icon: ShoppingBagIcon,
    isPersonalized: false,
    questions: [
        { question: 'Do you enjoy going shopping?', answer: 'Yes, I enjoy shopping, especially for clothes. I like to go to the big shopping centre in my city on Saturdays.' },
        { question: 'What kind of things do you usually buy?', answer: 'I usually buy food from the supermarket every week. Sometimes, I buy new clothes or a book if I see something I like.' }
    ]
  },
  {
    topic: 'Sports',
    icon: TrophyIcon,
    isPersonalized: false,
    questions: [
        { question: 'Do you play any sports?', answer: 'I don\'t play in a team, but I like to play football with my friends in the park. I also go swimming once a week.' },
        { question: 'What is a popular sport in your country?', answer: 'In my country, football is very popular. Many people watch the matches on TV and support their favourite team.' }
    ]
  },
  {
    topic: 'Films & TV',
    icon: TicketIcon,
    isPersonalized: false,
    questions: [
        { question: 'Do you like watching films?', answer: 'Yes, I love watching films. I usually watch them at home on my TV, but sometimes I go to the cinema with my friends.' },
        { question: 'What kind of films do you like?', answer: 'I like comedies because they make me laugh. I also enjoy action films because they are exciting.' }
    ]
  },
  {
    topic: 'Birthdays',
    icon: SparklesIcon,
    isPersonalized: false,
    questions: [
        { question: 'How do you usually celebrate your birthday?', answer: 'I usually have a small party at home with my family and a few close friends. We eat cake, and I get some presents.' },
        { question: 'What did you do for your last birthday?', answer: 'For my last birthday, I went out for dinner at a nice Italian restaurant with my husband. The food was delicious.' }
    ]
  },
  {
    topic: 'Technology',
    icon: PhoneIcon,
    isPersonalized: false,
    questions: [
        { question: 'How often do you use the internet?', answer: 'I use the internet every day. I use it on my phone and my computer to check emails, read the news, and talk to my friends.' },
        { question: 'What do you use your mobile phone for?', answer: 'I use my mobile phone for many things. I make calls, send text messages, and use social media. I also use it to take photos and listen to music.' }
    ]
  },
  {
    topic: 'Animals & Pets',
    icon: HeartIcon,
    isPersonalized: false,
    questions: [
        { question: 'Do you have any pets?', answer: 'Yes, I have a cat. Her name is Luna. She is very playful and I love her very much.' },
        { question: 'What is your favourite animal?', answer: 'My favourite animal is a dog because they are friendly and loyal. I would like to have a dog one day.' }
    ]
  },
  {
    topic: 'Music',
    icon: SpeakerWaveIcon,
    isPersonalized: false,
    questions: [
        { question: 'Do you like listening to music?', answer: 'Yes, I listen to music every day. It helps me to relax. I usually listen on my phone with headphones.' },
        { question: 'What kind of music do you like?', answer: 'I like listening to pop music because it is cheerful. I also like classical music when I am studying.' }
    ]
  },
  {
    topic: 'Books & Reading',
    icon: BookOpenIcon,
    isPersonalized: false,
    questions: [
        { question: 'Do you enjoy reading?', answer: 'Yes, I enjoy reading very much. I try to read for a little bit every night before I go to sleep. It is a good way to relax.' },
        { question: 'What kind of books do you read?', answer: 'I like to read stories, which are called novels. I especially like mystery stories because they are exciting and I want to know what happens in the end.' }
    ]
  },
  {
    topic: 'Weekends',
    icon: CalendarDaysIcon,
    isPersonalized: false,
    questions: [
        { question: 'What do you usually do on the weekend?', answer: 'On the weekend, I like to relax. On Saturday, I often meet my friends for coffee. On Sunday, I clean my flat and prepare for the next week.' },
        { question: 'How is your weekend different from your weekday?', answer: 'During the week, I am very busy with work. The weekend is different because I have more free time. I can sleep a little longer in the morning.' }
    ]
  },
  {
    topic: 'Clothes',
    icon: ShoppingBagIcon,
    isPersonalized: false,
    questions: [
        { question: 'What kind of clothes do you usually wear?', answer: 'I usually wear comfortable clothes like jeans and a T-shirt. If the weather is cold, I wear a warm jumper or a coat.' },
        { question: 'What do you wear for a special occasion, like a party?', answer: 'For a special occasion, I like to dress up. I might wear a nice dress or a smart shirt and trousers. It is nice to wear something different.' }
    ]
  },
  {
    topic: 'Friends',
    icon: UserGroupIcon,
    isPersonalized: false,
    questions: [
        { question: "Tell me about your best friend.", answer: "My best friend is called Maria. We have been friends for many years. She is very kind and funny, and we like to go shopping together." },
        { question: "What do you like to do with your friends?", answer: "With my friends, I like to go to the cinema or for a coffee. Sometimes we just stay at home and watch TV. It's always nice to spend time with them." }
    ]
  },
  {
    topic: 'Your Country',
    icon: MapPinIcon,
    isPersonalized: false,
    questions: [
        { question: "What is your country famous for?", answer: "My country is famous for its beautiful mountains and its delicious food. Many tourists visit every year to enjoy the nature and try our traditional dishes." },
        { question: "What is the most beautiful place in your country?", answer: "I think the most beautiful place is the coast. There are long sandy beaches and the water is very blue. It is a wonderful place to relax." }
    ]
  },
  {
    topic: 'Restaurants',
    icon: HeartIcon,
    isPersonalized: false,
    questions: [
        { question: "Do you like eating in restaurants?", answer: "Yes, I enjoy eating in restaurants for special occasions, like a birthday. It is nice to try different food and not have to cook at home." },
        { question: "What kind of restaurants do you like?", answer: "I really like Italian restaurants because my favourite food is pasta and pizza. I also like restaurants that serve food from my country." }
    ]
  },
  {
    topic: 'Health & Fitness',
    icon: HeartIcon,
    isPersonalized: false,
    questions: [
        { question: "What do you do to stay healthy?", answer: "To stay healthy, I try to eat a lot of fruit and vegetables. I also go for a walk every day, and I drink a lot of water. It is very important." },
        { question: "Is it important to eat healthy food? Why?", answer: "Yes, I think it is very important. Healthy food gives you energy and helps you to not get sick. It makes you feel good." }
    ]
  },
  {
    topic: 'The Future',
    icon: SparklesIcon,
    isPersonalized: false,
    questions: [
        { question: "What are your plans for next year?", answer: "Next year, I plan to continue studying English. I also want to find a new job. I hope it will be a good year for me." },
        { question: "Where do you see yourself in five years?", answer: "In five years, I hope to have a good job and maybe live in a bigger house. I also want to travel to a new country." }
    ]
  },
  {
    topic: 'Learning English',
    icon: AcademicCapIcon,
    isPersonalized: false,
    questions: [
        { question: "Why are you learning English?", answer: "I am learning English because it is important for my job. It is also a very useful language for travelling and meeting new people from different countries." },
        { question: "What is the most difficult part of learning English for you?", answer: "For me, the most difficult part is the grammar. There are many rules, and sometimes it is confusing. I also need to practice my pronunciation." }
    ]
  },
  {
    topic: 'Festivals & Celebrations',
    icon: TicketIcon,
    isPersonalized: false,
    questions: [
        { question: "What is an important festival in your country?", answer: "A very important festival in my country is the New Year celebration. It is a big event and everyone is very happy." },
        { question: "How do you celebrate it?", answer: "We celebrate with a big family dinner. We eat special food, and at midnight, we watch fireworks. It is a very exciting time." }
    ]
  },
  {
    topic: 'Your Neighbours',
    icon: HomeIcon,
    isPersonalized: false,
    questions: [
        { question: "Do you know your neighbours?", answer: "Yes, I know my neighbours. They are a nice family with two small children. We sometimes say hello in the morning when we leave for work." },
        { question: "Is it important to have good neighbours?", answer: "Yes, I think it is very important. Good neighbours can help you if you have a problem. It is nice to live in a friendly place." }
    ]
  },
  {
    topic: 'Seasons',
    icon: SunIcon,
    isPersonalized: false,
    questions: [
        { question: "What is your favourite season? Why?", answer: "My favourite season is summer. I like it because the weather is warm and sunny, and the days are long. I can spend more time outside." },
        { question: "What do you usually do in the winter?", answer: "In the winter, it is often cold, so I spend more time at home. I like to read books and watch films. Sometimes, I go for a short walk if it is not too cold." }
    ]
  },
  {
    topic: 'Your Favourite Place',
    icon: MapPinIcon,
    isPersonalized: false,
    questions: [
        { question: "What is your favourite place to go in your free time?", answer: "My favourite place to go is a small cafe in the city centre. It is very quiet and they have delicious coffee and cakes." },
        { question: "Can you describe this place to me?", answer: "It has big windows, comfortable chairs, and friendly staff. I like to go there with a book and relax for an hour. It's a very peaceful place." }
    ]
  },
  {
    topic: 'Money',
    icon: ShoppingBagIcon,
    isPersonalized: false,
    questions: [
        { question: "Is it important to save money? Why?", answer: "Yes, it is very important to save money. You can use it for big things in the future, like buying a house, or for an emergency." },
        { question: "What would you buy if you won a lot of money?", answer: "If I won a lot of money, I would buy a beautiful house for my family. I would also travel around the world and visit many countries." }
    ]
  },
  {
    topic: 'News & Media',
    icon: BookOpenIcon,
    isPersonalized: false,
    questions: [
        { question: "How do you get the news?", answer: "I usually get the news from the internet. I read news websites on my phone in the morning. Sometimes I also watch the news on TV in the evening." },
        { question: "Do you think it's important to follow the news?", answer: "Yes, I think it is important because you know what is happening in your country and around the world. It is good to be informed." }
    ]
  },
  {
    topic: 'Going Out',
    icon: TicketIcon,
    isPersonalized: false,
    questions: [
        { question: "What do you like to do when you go out in the evening?", answer: "In the evening, I sometimes go out for dinner with my friends. We like to try different restaurants. After dinner, we might go for a walk." },
        { question: "Do you prefer going to the cinema or a concert?", answer: "I prefer going to the cinema because I love watching films on a big screen. I find concerts are often too loud for me." }
    ]
  },
  {
    topic: 'Your Childhood',
    icon: SparklesIcon,
    isPersonalized: false,
    questions: [
        { question: "Where did you grow up?", answer: "I grew up in a small town by the sea. It was a lovely place to be a child. I spent a lot of time playing on the beach with my friends." },
        { question: "What was your favourite game when you were a child?", answer: "My favourite game was hide-and-seek. I used to play it with my brother and our friends in the park. It was very exciting." }
    ]
  },
  {
    topic: 'The Internet',
    icon: PhoneIcon,
    isPersonalized: false,
    questions: [
        { question: "How has the internet changed your life?", answer: "The internet has changed my life a lot. It is very easy to find information for my studies and to stay in contact with my family who live far away." },
        { question: "What websites do you visit often?", answer: "I often visit websites for news and weather. I also use social media websites like Facebook to see what my friends are doing." }
    ]
  },
  {
    topic: 'Cooking',
    icon: HeartIcon,
    isPersonalized: false,
    questions: [
        { question: "Can you cook? What can you make?", answer: "Yes, I can cook. I'm not a chef, but I can make simple meals. I often cook pasta with tomato sauce, or I make chicken with rice and vegetables." },
        { question: "What is a traditional dish from your country?", answer: "A traditional dish from my country is very delicious. It is made with rice, chicken, and many spices. We usually eat it on special occasions." }
    ]
  },
  {
    topic: 'Flowers & Plants',
    icon: SunIcon,
    isPersonalized: false,
    questions: [
        { question: "Do you like flowers? What is your favourite flower?", answer: "Yes, I love flowers. They are beautiful and smell nice. My favourite flower is the rose because it is very elegant and comes in many colours." },
        { question: "Do you have any plants in your home?", answer: "Yes, I have a few small plants on my windowsill. They make the room look nice and green. I have to remember to water them every week." }
    ]
  },
  {
    topic: 'Your Bedroom',
    icon: HomeIcon,
    isPersonalized: false,
    questions: [
        { question: "Can you describe your bedroom?", answer: "My bedroom is not very big, but it is very cosy. There is a bed, a wardrobe for my clothes, and a small desk next to the window. The walls are a light blue colour." },
        { question: "What is your favourite thing in your bedroom?", answer: "My favourite thing is my bed. It is very comfortable and I love to read in my bed before I go to sleep. It is my place to relax." }
    ]
  },
  {
    topic: 'Public Holidays',
    icon: CalendarDaysIcon,
    isPersonalized: false,
    questions: [
        { question: "What is a big public holiday in your country?", answer: "A big public holiday is Independence Day. On this day, we celebrate our country's history. Most people do not work on this day." },
        { question: "What do people usually do on that day?", answer: "People usually spend time with their families. Many cities have parades and fireworks in the evening. It is a very happy and patriotic day." }
    ]
  },
  {
    topic: 'Your Last Vacation',
    icon: PhotoIcon,
    isPersonalized: false,
    questions: [
        { question: "Tell me about your last vacation.", answer: "My last vacation was a trip to the mountains. I went with my family for a few days. We stayed in a small hotel and went hiking during the day." },
        { question: "What was the best part of your trip?", answer: "The best part of the trip was the beautiful view from the top of the mountain. The air was very fresh and it was very quiet. It was wonderful." }
    ]
  },
  {
    topic: 'Future Travel',
    icon: MapPinIcon,
    isPersonalized: false,
    questions: [
        { question: "Which country would you like to visit in the future? Why?", answer: "I would love to visit Italy in the future. I want to see the historical places in Rome and I also want to eat real Italian pizza and pasta." },
        { question: "Do you prefer to travel alone or with other people?", answer: "I prefer to travel with my family or friends. It is more fun to share the experience with someone and it is also safer." }
    ]
  },
  {
    topic: 'Weekdays',
    icon: CalendarDaysIcon,
    isPersonalized: false,
    questions: [
        { question: "What is a typical Tuesday like for you?", answer: "On a typical Tuesday, I go to work in the morning. After work, I go to the gym for an hour. In the evening, I cook dinner and watch some TV." },
        { question: "Which is your busiest day of the week?", answer: "My busiest day is usually Monday. I have a lot of emails to answer at work, and I have a meeting with my team. The day goes by very fast." }
    ]
  },
  {
    topic: 'Helping People',
    icon: UserGroupIcon,
    isPersonalized: false,
    questions: [
        { question: "Do you think it's important to help other people?", answer: "Yes, I think it is very important. When we help others, it makes us feel good, and it makes the world a better place. A small act of kindness can make a big difference." },
        { question: "Tell me about a time you helped someone.", answer: "Last week, I saw an old lady who dropped her shopping bags. I helped her pick everything up. She was very happy and thanked me." }
    ]
  },
  {
    topic: 'Cars & Driving',
    icon: TicketIcon,
    isPersonalized: false,
    questions: [
        { question: "Do you know how to drive a car?", answer: "Yes, I can drive. I got my driving license five years ago. I have a small car that I use to go to work and to the supermarket." },
        { question: "Do you prefer travelling by car or by public transport?", answer: "It depends. I prefer the car for shopping because it is easy to carry things. But for going to the city centre, I prefer the bus because parking is difficult and expensive." }
    ]
  },
  {
    topic: 'Art & Museums',
    icon: PhotoIcon,
    isPersonalized: false,
    questions: [
        { question: "Do you like visiting art galleries or museums?", answer: "I don't go very often, but I find museums interesting. I like history museums because you can learn about the past. Art galleries are nice but sometimes I don't understand the art." },
        { question: "What kind of art do you like?", answer: "I like paintings of landscapes, with mountains, rivers and trees. I find them very beautiful and calming to look at. I have a nice painting of the sea in my living room." }
    ]
  },
  {
    topic: 'Being Happy',
    icon: HeartIcon,
    isPersonalized: false,
    questions: [
        { question: "What makes you happy?", answer: "Spending time with my family makes me very happy. Also, small things like a sunny day or a good cup of coffee can make me happy." },
        { question: "What did you do recently that made you happy?", answer: "Last weekend, I went for a walk in the countryside with my husband. The weather was beautiful and it was very peaceful. It made me feel very happy and relaxed." }
    ]
  },
  {
    topic: 'Your City Centre',
    icon: MapPinIcon,
    isPersonalized: false,
    questions: [
        { question: "What is the centre of your town or city like?", answer: "The city centre is very busy. There are many shops, restaurants, and offices. There is also a big square where people like to meet." },
        { question: "What can you do there in the evening?", answer: "In the evening, you can go to the cinema, or have dinner in a restaurant. There are also many pubs and cafes that are open late. It is a lively place at night." }
    ]
  },
  {
    topic: 'Parties',
    icon: SparklesIcon,
    isPersonalized: false,
    questions: [
        { question: "Do you enjoy going to parties?", answer: "I enjoy small parties with close friends and family. I don't like big, noisy parties very much. I prefer to have a nice conversation." },
        { question: "Tell me about a party you went to recently.", answer: "Last month, I went to my friend's birthday party. It was at her house. We had some food, listened to music, and we all sang 'Happy Birthday' when she cut the cake." }
    ]
  },
  {
    topic: 'Gifts',
    icon: ShoppingBagIcon,
    isPersonalized: false,
    questions: [
        { question: "When do people give gifts in your country?", answer: "In my country, people give gifts for birthdays, weddings, and at special festivals like Christmas or Eid. It is a way to show you care about someone." },
        { question: "What is the best gift you have ever received?", answer: "The best gift I ever received was a watch from my parents for my 21st birthday. It is very special to me because it was a thoughtful gift." }
    ]
  },
  {
    topic: 'Your Phone',
    icon: PhoneIcon,
    isPersonalized: false,
    questions: [
        { question: "How important is your mobile phone to you?", answer: "My mobile phone is very important. I use it for everything - to call my family, to send messages to friends, and to check my emails for work." },
        { question: "Do you think people use their phones too much?", answer: "Yes, sometimes I think so. You see people in restaurants looking at their phones and not talking to each other. It's a little sad." }
    ]
  },
  {
    topic: 'Languages',
    icon: SpeakerWaveIcon,
    isPersonalized: false,
    questions: [
      { question: 'How many languages can you speak?', answer: 'I can speak two languages. My first language is [your language], and I am learning English. It is difficult but I enjoy it.' },
      { question: 'Do you think it is important to learn other languages?', answer: 'Yes, I think it is very important. It helps you understand other cultures and it is very useful when you travel to different countries.' },
    ],
  },
  {
    topic: 'Plans for the Weekend',
    icon: CalendarDaysIcon,
    isPersonalized: false,
    questions: [
      { question: 'What are your plans for this weekend?', answer: 'This weekend, I am going to visit my sister. We are planning to go shopping and then see a film at the cinema on Saturday.' },
      { question: 'Do you prefer a busy weekend or a relaxing weekend?', answer: 'I usually prefer a relaxing weekend because my weekdays are very busy. I like to have time to rest, read a book, and just stay at home.' },
    ],
  },
  {
    topic: 'Your Favourite Room',
    icon: HomeIcon,
    isPersonalized: false,
    questions: [
      { question: 'What is your favourite room in your house?', answer: 'My favourite room is the kitchen. I love cooking, and my kitchen is very bright and has a big table where my family can eat together.' },
      { question: 'How would you change your home if you could?', answer: 'If I could, I would like to have a bigger garden. I love plants and flowers, so it would be nice to have more space outside.' },
    ],
  },
  {
    topic: 'The News',
    icon: BookOpenIcon,
    isPersonalized: false,
    questions: [
      { question: 'Did you see the news today?', answer: 'Yes, I read some news online this morning. I read about the weather and also some news about my local area. I did not watch TV news.' },
      { question: 'What kind of news interests you the most?', answer: 'I am most interested in news about science and technology. I like to learn about new discoveries. I find political news a bit boring.' },
    ],
  },
  {
    topic: 'Directions',
    icon: MapPinIcon,
    isPersonalized: true,
    promptText: 'Want more practice? Enter a real place near you (e.g., "the post office", "Sainsbury\'s") to get custom AI questions.',
    inputPlaceholder: 'e.g., the local park',
    questions: [
      { question: "How do you get to the nearest grocery shop from your home?", answer: "When I come out from my home, I take a right. Then I go a few hundred yards and take another right. After a two-minute walk, I cross the road, and the grocery shop is right there." },
      { question: "Is there a park near your house? How do you get there?", answer: "Yes, there is a lovely park nearby. I turn left from my front door and walk straight for about ten minutes. I pass a school on my left, and the park entrance is just after that. It's very easy to find." }
    ]
  },
];

const QuestionPractice: React.FC<{ qa: TopicQA; }> = ({ qa }) => {
    const { question, answer: exampleAnswer } = qa;
    const [userTranscript, setUserTranscript] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<AnswerAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showExample, setShowExample] = useState(false);
    
    const { isListening, startListening, stopListening, error } = useSpeechRecognition((transcript) => {
        setUserTranscript(transcript);
        setAnalysis(null);
    });

    const handleGetFeedback = async () => {
        if (!userTranscript) return;
        setIsAnalyzing(true);
        setAnalysis(null);
        const result = await analyzeUserAnswer(question, userTranscript, exampleAnswer);
        setAnalysis(result);
        setIsAnalyzing(false);
    };

    return (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="font-semibold text-slate-800 dark:text-slate-100">{question}</p>
            
            <div className="mt-3">
                <button onClick={() => setShowExample(!showExample)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    {showExample ? 'Hide' : 'Show'} Example Answer
                </button>
                {showExample && (
                    <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-md animate-fade-in">
                        <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{exampleAnswer}"</p>
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center gap-4">
                <button
                    onClick={isListening ? stopListening : startListening}
                    className={`select-none flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 ease-in-out shadow-md focus:outline-none focus:ring-4 active:scale-95
                    ${isListening 
                        ? 'bg-rose-500 text-white focus:ring-rose-300 animate-pulse' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-300'
                    }`}
                >
                    <MicrophoneIcon className="w-7 h-7" />
                </button>
                <div className="flex-1 text-sm text-slate-500 dark:text-slate-400">
                    {error && <p className="text-rose-500 font-medium">{error}</p>}
                    {isListening && <p>Listening... Tap the microphone to stop.</p>}
                    {userTranscript && !isListening && (
                         <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                            <p className="font-medium text-slate-500 dark:text-slate-400">You said:</p>
                            <p className="italic text-slate-700 dark:text-slate-300">"{userTranscript}"</p>
                        </div>
                    )}
                </div>
            </div>

            {userTranscript && !isListening && (
                <div className="mt-4">
                    <button 
                        onClick={handleGetFeedback} 
                        disabled={isAnalyzing}
                        className="w-full select-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 active:bg-teal-700 text-sm font-semibold disabled:bg-teal-300"
                    >
                         <SparklesIcon className="w-4 h-4" />
                        {isAnalyzing ? 'Analyzing...' : 'Analyze My Answer'}
                    </button>
                </div>
            )}

            {analysis && (
                <div className="mt-4 space-y-3 animate-fade-in">
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg border border-yellow-200 dark:border-yellow-700">
                        <h4 className="font-bold text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2"><LightbulbIcon className="w-4 h-4" />Feedback</h4>
                        <p className="text-sm text-yellow-900 dark:text-yellow-100 mt-1">{analysis.feedback}</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg border border-green-200 dark:border-green-700">
                        <h4 className="font-bold text-sm text-green-800 dark:text-green-200 flex items-center gap-2"><CheckCircleIcon className="w-4 h-4" />Suggestion</h4>
                        <p className="text-sm text-green-900 dark:text-green-100 mt-1">{analysis.suggestion}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const PersonalizedPracticeGenerator: React.FC<{ module: TopicModule }> = ({ module }) => {
    const [userInput, setUserInput] = useState('');
    const [generatedQuestions, setGeneratedQuestions] = useState<TopicQA[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim()) {
            setError('Please enter a place or topic.');
            return;
        }
        setError('');
        setIsLoading(true);
        setGeneratedQuestions(null);
        const qas = await generatePersonalizedTopicQa(module.topic, userInput);
        setGeneratedQuestions(qas);
        setIsLoading(false);
    };

    const handleReset = () => {
        setUserInput('');
        setGeneratedQuestions(null);
        setError('');
    };
    
    // The container for this component has a top border and padding
    const containerClasses = "p-4 border-t border-slate-200 dark:border-slate-700";

    if (isLoading) {
         return (
             <div className={`${containerClasses} text-center`}>
                <p className="text-slate-600 dark:text-slate-400">Generating personalized questions for you...</p>
             </div>
         );
    }

    if (generatedQuestions) {
        return (
            <div className={`${containerClasses} space-y-4 animate-fade-in`}>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Showing personalized questions for: <strong className="text-slate-800 dark:text-slate-200">{userInput}</strong>
                </p>
                {generatedQuestions.map((qa, index) => (
                    <QuestionPractice key={index} qa={qa} />
                ))}
                <button
                    onClick={handleReset}
                    className="w-full mt-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    Practice with a different topic
                </button>
            </div>
        );
    }
    
    return (
        <div className={containerClasses}>
            <h4 className="font-semibold text-slate-800 dark:text-slate-100">{module.promptText}</h4>
            <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                 <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={module.inputPlaceholder}
                    className="flex-grow w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="select-none inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 active:bg-indigo-800 text-sm font-semibold disabled:bg-indigo-300"
                >
                    {isLoading ? '...' : 'Generate'}
                </button>
            </form>
            {error && <p className="text-rose-500 text-sm mt-2">{error}</p>}
        </div>
    );
};

const TopicPractice: React.FC = () => {
    const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

    const handleToggleTopic = (topic: string) => {
        setExpandedTopic(prev => (prev === topic ? null : topic));
    };
    
    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg animate-fade-in">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Topic Practice</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Practice common A2 topics. See an example, record your answer, and get instant AI feedback.</p>
                </div>

                <div className="space-y-4">
                    {practiceModules.map(module => {
                        const Icon = module.icon;
                        const isExpanded = expandedTopic === module.topic;
                        return (
                            <div key={module.topic} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <button 
                                    onClick={() => handleToggleTopic(module.topic)}
                                    className="w-full flex items-center justify-between p-4 text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{module.topic}</h3>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                {isExpanded && (
                                    <div className="animate-fade-in">
                                        {/* Render pre-loaded questions if they exist */}
                                        {module.questions && module.questions.length > 0 && (
                                            <div className="px-4 pt-4 pb-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                                                {module.questions.map((q, index) => (
                                                    <QuestionPractice key={index} qa={q} />
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Render personalized generator if the module is personalized. 
                                            The generator includes its own top border, which acts as a separator.
                                        */}
                                        {module.isPersonalized && (
                                            <PersonalizedPracticeGenerator module={module} />
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TopicPractice;