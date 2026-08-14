"""
Duolingo-style Spanish exercise bank.
Each skill has 2 lessons; every lesson mixes all 5 exercise types with plausible distractors.
"""


def _mc(prompt, question, options, order):
    return {
        'type': 'multiple_choice',
        'prompt': prompt,
        'order': order,
        'content': {'question': question, 'options': options},
    }


def _translate(prompt, source_text, correct_words, word_bank, order):
    return {
        'type': 'translate',
        'prompt': prompt,
        'order': order,
        'content': {
            'source_text': source_text,
            'correct_words': correct_words,
            'word_bank': word_bank,
        },
    }


def _pairs(prompt, pairs, order):
    return {
        'type': 'match_pairs',
        'prompt': prompt,
        'order': order,
        'content': {'pairs': pairs},
    }


def _blank(prompt, parts, correct, options, order):
    return {
        'type': 'fill_blank',
        'prompt': prompt,
        'order': order,
        'content': {
            'sentence_parts': parts,
            'correct_word': correct,
            'options': options,
        },
    }


def _type(prompt, prompt_text, accepted_answers, order):
    return {
        'type': 'type_answer',
        'prompt': prompt,
        'order': order,
        'content': {
            'prompt_text': prompt_text,
            'accepted_answers': accepted_answers,
        },
    }


# ---------------------------------------------------------------------------
# UNIT 1 — Foundations
# ---------------------------------------------------------------------------

BASICS_1 = {
    1: [
        _mc(
            'What is "the boy" in Spanish?',
            'the boy',
            [
                {'text': 'el niño', 'correct': True, 'image': 'boy'},
                {'text': 'la niña', 'correct': False, 'image': 'girl'},
                {'text': 'el hombre', 'correct': False, 'image': 'man'},
                {'text': 'la mujer', 'correct': False, 'image': 'woman'},
            ],
            1,
        ),
        _mc(
            'What does "agua" mean?',
            'agua',
            [
                {'text': 'water', 'correct': True, 'image': 'water'},
                {'text': 'milk', 'correct': False, 'image': 'milk'},
                {'text': 'bread', 'correct': False, 'image': 'bread'},
                {'text': 'apple', 'correct': False, 'image': 'apple'},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'La niña bebe agua.',
            ['The', 'girl', 'drinks', 'water.'],
            ['The', 'girl', 'drinks', 'water.', 'boy', 'eats', 'an', 'apple', 'woman'],
            3,
        ),
        _pairs(
            'Tap the matching pairs',
            [
                {'left': 'el niño', 'right': 'the boy'},
                {'left': 'la mujer', 'right': 'the woman'},
                {'left': 'agua', 'right': 'water'},
                {'left': 'manzana', 'right': 'apple'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['El niño ', ' agua.'],
            'bebe',
            ['bebe', 'come', 'es', 'soy'],
            5,
        ),
        _type(
            'Write this in Spanish',
            'A man and a woman',
            ['Un hombre y una mujer', 'un hombre y una mujer'],
            6,
        ),
    ],
    2: [
        _mc(
            'Which sentence is correct?',
            'She eats an apple.',
            [
                {'text': 'Ella come una manzana.', 'correct': True, 'image': 'apple'},
                {'text': 'Ella bebe una manzana.', 'correct': False, 'image': 'apple'},
                {'text': 'Él come una manzana.', 'correct': False, 'image': 'apple'},
                {'text': 'Ella come un agua.', 'correct': False, 'image': 'water'},
            ],
            1,
        ),
        _mc(
            'Select the correct translation for "milk"',
            'milk',
            [
                {'text': 'leche', 'correct': True, 'image': 'milk'},
                {'text': 'pan', 'correct': False, 'image': 'bread'},
                {'text': 'agua', 'correct': False, 'image': 'water'},
                {'text': 'café', 'correct': False, 'image': 'coffee'},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'El hombre come pan.',
            ['The', 'man', 'eats', 'bread.'],
            ['The', 'man', 'eats', 'bread.', 'woman', 'drinks', 'water', 'milk'],
            3,
        ),
        _pairs(
            'Tap the matching pairs',
            [
                {'left': 'come', 'right': 'eats'},
                {'left': 'bebe', 'right': 'drinks'},
                {'left': 'pan', 'right': 'bread'},
                {'left': 'leche', 'right': 'milk'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['La mujer ', ' leche.'],
            'bebe',
            ['bebe', 'come', 'es', 'son'],
            5,
        ),
        _type(
            'Write this in English',
            'La niña come una manzana.',
            ['The girl eats an apple.', 'The girl eats an apple', 'the girl eats an apple.'],
            6,
        ),
    ],
}

PHRASES = {
    1: [
        _mc(
            'How do you say "Hello!"?',
            'Hello!',
            [
                {'text': '¡Hola!', 'correct': True},
                {'text': '¡Adiós!', 'correct': False},
                {'text': 'Gracias', 'correct': False},
                {'text': 'Por favor', 'correct': False},
            ],
            1,
        ),
        _mc(
            'What does "Buenos días" mean?',
            'Buenos días',
            [
                {'text': 'Good morning', 'correct': True},
                {'text': 'Good night', 'correct': False},
                {'text': 'Goodbye', 'correct': False},
                {'text': 'See you later', 'correct': False},
            ],
            2,
        ),
        _translate(
            'Translate this greeting',
            'Buenos días, ¿cómo estás?',
            ['Good', 'morning,', 'how', 'are', 'you?'],
            ['Good', 'morning,', 'how', 'are', 'you?', 'night', 'hello', 'thank', 'you'],
            3,
        ),
        _pairs(
            'Match the phrases',
            [
                {'left': '¡Hola!', 'right': 'Hello!'},
                {'left': 'Gracias', 'right': 'Thank you'},
                {'left': 'Por favor', 'right': 'Please'},
                {'left': '¡Adiós!', 'right': 'Goodbye!'},
            ],
            4,
        ),
        _blank(
            'Complete the greeting',
            ['¡Buenos ', '!'],
            'días',
            ['días', 'noches', 'tardes', 'hola'],
            5,
        ),
        _type(
            'Write this in Spanish',
            'Thank you very much',
            ['Muchas gracias', 'muchas gracias'],
            6,
        ),
    ],
    2: [
        _mc(
            'How do you respond to "¿Cómo estás?"',
            'I am fine, thanks.',
            [
                {'text': 'Estoy bien, gracias.', 'correct': True},
                {'text': 'Mucho gusto.', 'correct': False},
                {'text': 'De nada.', 'correct': False},
                {'text': 'Hasta luego.', 'correct': False},
            ],
            1,
        ),
        _mc(
            'What does "De nada" mean?',
            'De nada',
            [
                {'text': "You're welcome", 'correct': True},
                {'text': 'Excuse me', 'correct': False},
                {'text': 'Nice to meet you', 'correct': False},
                {'text': 'See you tomorrow', 'correct': False},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'Mucho gusto, me llamo Ana.',
            ['Nice', 'to', 'meet', 'you,', 'my', 'name', 'is', 'Ana.'],
            ['Nice', 'to', 'meet', 'you,', 'my', 'name', 'is', 'Ana.', 'I', 'am', 'good', 'thanks'],
            3,
        ),
        _pairs(
            'Match the expressions',
            [
                {'left': '¿Cómo estás?', 'right': 'How are you?'},
                {'left': 'Mucho gusto', 'right': 'Nice to meet you'},
                {'left': 'De nada', 'right': "You're welcome"},
                {'left': 'Hasta luego', 'right': 'See you later'},
            ],
            4,
        ),
        _blank(
            'Complete the phrase',
            ['Me ', ' Carlos.'],
            'llamo',
            ['llamo', 'soy', 'estoy', 'tengo'],
            5,
        ),
        _type(
            'Write this in Spanish',
            'See you later',
            ['Hasta luego', 'hasta luego', 'Hasta luego.'],
            6,
        ),
    ],
}

BASICS_2 = {
    1: [
        _mc(
            'Which word means "and"?',
            'and',
            [
                {'text': 'y', 'correct': True},
                {'text': 'o', 'correct': False},
                {'text': 'pero', 'correct': False},
                {'text': 'con', 'correct': False},
            ],
            1,
        ),
        _mc(
            'Select the correct sentence',
            'We are students.',
            [
                {'text': 'Somos estudiantes.', 'correct': True},
                {'text': 'Son estudiantes.', 'correct': False},
                {'text': 'Soy estudiantes.', 'correct': False},
                {'text': 'Somos estudiante.', 'correct': False},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'Yo soy un estudiante.',
            ['I', 'am', 'a', 'student.'],
            ['I', 'am', 'a', 'student.', 'You', 'we', 'teacher', 'is'],
            3,
        ),
        _pairs(
            'Match the pronouns',
            [
                {'left': 'yo', 'right': 'I'},
                {'left': 'tú', 'right': 'you'},
                {'left': 'él', 'right': 'he'},
                {'left': 'ella', 'right': 'she'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['Tú ', ' mi amigo.'],
            'eres',
            ['eres', 'es', 'somos', 'soy'],
            5,
        ),
        _type(
            'Write this in Spanish',
            'They are teachers.',
            ['Ellos son profesores.', 'Ellos son profesores', 'ellos son profesores.'],
            6,
        ),
    ],
    2: [
        _mc(
            'What is "the cat" in Spanish?',
            'the cat',
            [
                {'text': 'el gato', 'correct': True, 'image': 'cat'},
                {'text': 'el perro', 'correct': False, 'image': 'dog'},
                {'text': 'el pájaro', 'correct': False, 'image': 'bird'},
                {'text': 'el pez', 'correct': False, 'image': 'fish'},
            ],
            1,
        ),
        _mc(
            'Which sentence is correct?',
            'It is a book.',
            [
                {'text': 'Es un libro.', 'correct': True, 'image': 'book'},
                {'text': 'Es una libro.', 'correct': False, 'image': 'book'},
                {'text': 'Son un libro.', 'correct': False, 'image': 'book'},
                {'text': 'Está un libro.', 'correct': False, 'image': 'book'},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'Nosotros somos amigos.',
            ['We', 'are', 'friends.'],
            ['We', 'are', 'friends.', 'They', 'you', 'family', 'students'],
            3,
        ),
        _pairs(
            'Match the words',
            [
                {'left': 'nosotros', 'right': 'we'},
                {'left': 'ellos', 'right': 'they'},
                {'left': 'amigo', 'right': 'friend'},
                {'left': 'libro', 'right': 'book'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['Ella ', ' una estudiante.'],
            'es',
            ['es', 'son', 'soy', 'eres'],
            5,
        ),
        _type(
            'Write this in English',
            'Él es mi amigo.',
            ['He is my friend.', 'He is my friend', 'he is my friend.'],
            6,
        ),
    ],
}

# ---------------------------------------------------------------------------
# UNIT 2 — Food & daily life
# ---------------------------------------------------------------------------

FOOD = {
    1: [
        _mc(
            'What is "the bread" in Spanish?',
            'the bread',
            [
                {'text': 'el pan', 'correct': True, 'image': 'bread'},
                {'text': 'la leche', 'correct': False, 'image': 'milk'},
                {'text': 'el arroz', 'correct': False, 'image': 'rice'},
                {'text': 'el queso', 'correct': False, 'image': 'cheese'},
            ],
            1,
        ),
        _mc(
            'How do you say "I would like water, please"?',
            'I would like water, please.',
            [
                {'text': 'Quiero agua, por favor.', 'correct': True, 'image': 'water'},
                {'text': 'Quiero pan, por favor.', 'correct': False, 'image': 'bread'},
                {'text': 'Quiero agua, gracias.', 'correct': False, 'image': 'water'},
                {'text': 'Tengo agua, por favor.', 'correct': False, 'image': 'water'},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'Quiero una manzana y un café.',
            ['I', 'want', 'an', 'apple', 'and', 'a', 'coffee.'],
            ['I', 'want', 'an', 'apple', 'and', 'a', 'coffee.', 'bread', 'water', 'please', 'eat'],
            3,
        ),
        _pairs(
            'Match the food words',
            [
                {'left': 'pan', 'right': 'bread'},
                {'left': 'queso', 'right': 'cheese'},
                {'left': 'arroz', 'right': 'rice'},
                {'left': 'café', 'right': 'coffee'},
            ],
            4,
        ),
        _blank(
            'Complete the order',
            ['Quiero ', ', por favor.'],
            'leche',
            ['leche', 'perro', 'libro', 'coche'],
            5,
        ),
        _type(
            'Write this in Spanish',
            'The food is delicious.',
            ['La comida está deliciosa.', 'La comida esta deliciosa.', 'la comida está deliciosa.'],
            6,
        ),
    ],
    2: [
        _mc(
            'What does "La cuenta, por favor" mean?',
            'La cuenta, por favor',
            [
                {'text': 'The check, please', 'correct': True},
                {'text': 'The menu, please', 'correct': False},
                {'text': 'More water, please', 'correct': False},
                {'text': 'It is delicious', 'correct': False},
            ],
            1,
        ),
        _mc(
            'Select the correct word for "breakfast"',
            'breakfast',
            [
                {'text': 'el desayuno', 'correct': True},
                {'text': 'la cena', 'correct': False},
                {'text': 'el almuerzo', 'correct': False},
                {'text': 'la comida', 'correct': False},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'El arroz con pollo es muy bueno.',
            ['The', 'rice', 'with', 'chicken', 'is', 'very', 'good.'],
            ['The', 'rice', 'with', 'chicken', 'is', 'very', 'good.', 'bread', 'bad', 'water', 'and'],
            3,
        ),
        _pairs(
            'Match the meal words',
            [
                {'left': 'desayuno', 'right': 'breakfast'},
                {'left': 'almuerzo', 'right': 'lunch'},
                {'left': 'cena', 'right': 'dinner'},
                {'left': 'comida', 'right': 'food / meal'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['Me gusta el ', ' con queso.'],
            'pan',
            ['pan', 'agua', 'autobús', 'gato'],
            5,
        ),
        _type(
            'Write this in English',
            '¿Qué quieres comer?',
            ['What do you want to eat?', 'What do you want to eat', 'what do you want to eat?'],
            6,
        ),
    ],
}

ANIMALS = {
    1: [
        _mc(
            'What is "the dog" in Spanish?',
            'the dog',
            [
                {'text': 'el perro', 'correct': True, 'image': 'dog'},
                {'text': 'el gato', 'correct': False, 'image': 'cat'},
                {'text': 'el pájaro', 'correct': False, 'image': 'bird'},
                {'text': 'el caballo', 'correct': False, 'image': 'horse'},
            ],
            1,
        ),
        _mc(
            'Which animal is "el pez"?',
            'el pez',
            [
                {'text': 'fish', 'correct': True, 'image': 'fish'},
                {'text': 'bird', 'correct': False, 'image': 'bird'},
                {'text': 'horse', 'correct': False, 'image': 'horse'},
                {'text': 'cat', 'correct': False, 'image': 'cat'},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'El gato es pequeño y blanco.',
            ['The', 'cat', 'is', 'small', 'and', 'white.'],
            ['The', 'cat', 'is', 'small', 'and', 'white.', 'dog', 'big', 'black', 'bird'],
            3,
        ),
        _pairs(
            'Match the animals',
            [
                {'left': 'perro', 'right': 'dog'},
                {'left': 'gato', 'right': 'cat'},
                {'left': 'pájaro', 'right': 'bird'},
                {'left': 'caballo', 'right': 'horse'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['El ', ' vive en el agua.'],
            'pez',
            ['pez', 'perro', 'pan', 'libro'],
            5,
        ),
        _type(
            'Write this in Spanish',
            'The bird sings in the morning.',
            ['El pájaro canta por la mañana.', 'El pajaro canta por la manana.', 'el pájaro canta por la mañana.'],
            6,
        ),
    ],
    2: [
        _mc(
            'What does "Me gustan los animales" mean?',
            'Me gustan los animales',
            [
                {'text': 'I like animals', 'correct': True},
                {'text': 'I have animals', 'correct': False},
                {'text': 'Animals are big', 'correct': False},
                {'text': 'I see an animal', 'correct': False},
            ],
            1,
        ),
        _mc(
            'Select the correct plural',
            'the cats',
            [
                {'text': 'los gatos', 'correct': True, 'image': 'cat'},
                {'text': 'las gatos', 'correct': False, 'image': 'cat'},
                {'text': 'los gato', 'correct': False, 'image': 'cat'},
                {'text': 'el gatos', 'correct': False, 'image': 'cat'},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'Los perros son muy amigables.',
            ['The', 'dogs', 'are', 'very', 'friendly.'],
            ['The', 'dogs', 'are', 'very', 'friendly.', 'cats', 'small', 'angry', 'birds'],
            3,
        ),
        _pairs(
            'Match the descriptions',
            [
                {'left': 'grande', 'right': 'big'},
                {'left': 'pequeño', 'right': 'small'},
                {'left': 'amigable', 'right': 'friendly'},
                {'left': 'rápido', 'right': 'fast'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['Mi ', ' se llama Luna.'],
            'gata',
            ['gata', 'libro', 'café', 'coche'],
            5,
        ),
        _type(
            'Write this in English',
            'Tengo un perro y un gato.',
            ['I have a dog and a cat.', 'I have a dog and a cat', 'i have a dog and a cat.'],
            6,
        ),
    ],
}

PLURALS = {
    1: [
        _mc(
            'What is the plural of "la manzana"?',
            'apples',
            [
                {'text': 'las manzanas', 'correct': True, 'image': 'apple'},
                {'text': 'los manzanas', 'correct': False, 'image': 'apple'},
                {'text': 'las manzana', 'correct': False, 'image': 'apple'},
                {'text': 'el manzanas', 'correct': False, 'image': 'apple'},
            ],
            1,
        ),
        _mc(
            'Select the correct sentence',
            'The boys drink water.',
            [
                {'text': 'Los niños beben agua.', 'correct': True, 'image': 'boy'},
                {'text': 'Los niño beben agua.', 'correct': False, 'image': 'boy'},
                {'text': 'Las niños beben agua.', 'correct': False, 'image': 'boy'},
                {'text': 'Los niños bebe agua.', 'correct': False, 'image': 'water'},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'Las mujeres comen pan.',
            ['The', 'women', 'eat', 'bread.'],
            ['The', 'women', 'eat', 'bread.', 'men', 'drink', 'apples', 'water'],
            3,
        ),
        _pairs(
            'Match singular and plural',
            [
                {'left': 'el niño', 'right': 'los niños'},
                {'left': 'la niña', 'right': 'las niñas'},
                {'left': 'un libro', 'right': 'unos libros'},
                {'left': 'una manzana', 'right': 'unas manzanas'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['Los estudiantes ', ' en la escuela.'],
            'estudian',
            ['estudian', 'estudio', 'estudia', 'estudiar'],
            5,
        ),
        _type(
            'Write this in Spanish',
            'The girls eat apples.',
            ['Las niñas comen manzanas.', 'Las ninas comen manzanas.', 'las niñas comen manzanas.'],
            6,
        ),
    ],
    2: [
        _mc(
            'Which article matches "casas" (houses)?',
            'houses',
            [
                {'text': 'las casas', 'correct': True},
                {'text': 'los casas', 'correct': False},
                {'text': 'el casas', 'correct': False},
                {'text': 'la casas', 'correct': False},
            ],
            1,
        ),
        _mc(
            'Select the correct translation',
            'We eat oranges.',
            [
                {'text': 'Comemos naranjas.', 'correct': True},
                {'text': 'Comemos naranja.', 'correct': False},
                {'text': 'Como naranjas.', 'correct': False},
                {'text': 'Comen naranjas.', 'correct': False},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'Ellos tienen dos perros.',
            ['They', 'have', 'two', 'dogs.'],
            ['They', 'have', 'two', 'dogs.', 'We', 'one', 'cat', 'three'],
            3,
        ),
        _pairs(
            'Match the numbers and nouns',
            [
                {'left': 'dos libros', 'right': 'two books'},
                {'left': 'tres gatos', 'right': 'three cats'},
                {'left': 'cuatro mesas', 'right': 'four tables'},
                {'left': 'cinco sillas', 'right': 'five chairs'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['Hay muchas ', ' en el parque.'],
            'flores',
            ['flores', 'flor', 'perro', 'café'],
            5,
        ),
        _type(
            'Write this in English',
            'Viven en unas casas grandes.',
            ['They live in big houses.', 'They live in big houses', 'they live in big houses.'],
            6,
        ),
    ],
}

# ---------------------------------------------------------------------------
# UNIT 3 — Travel & questions
# ---------------------------------------------------------------------------

TRAVEL = {
    1: [
        _mc(
            'How do you say "Where is the bus stop?"',
            'Where is the bus stop?',
            [
                {'text': '¿Dónde está la parada de autobús?', 'correct': True, 'image': 'bus'},
                {'text': '¿Dónde está el aeropuerto?', 'correct': False, 'image': 'plane'},
                {'text': '¿Cuánto cuesta el billete?', 'correct': False},
                {'text': '¿Qué hora es?', 'correct': False},
            ],
            1,
        ),
        _mc(
            'What does "el aeropuerto" mean?',
            'el aeropuerto',
            [
                {'text': 'the airport', 'correct': True, 'image': 'plane'},
                {'text': 'the train station', 'correct': False, 'image': 'train'},
                {'text': 'the hotel', 'correct': False},
                {'text': 'the ticket', 'correct': False},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'Necesito un billete para Madrid.',
            ['I', 'need', 'a', 'ticket', 'to', 'Madrid.'],
            ['I', 'need', 'a', 'ticket', 'to', 'Madrid.', 'want', 'hotel', 'from', 'Barcelona'],
            3,
        ),
        _pairs(
            'Match the travel words',
            [
                {'left': 'autobús', 'right': 'bus'},
                {'left': 'tren', 'right': 'train'},
                {'left': 'billete', 'right': 'ticket'},
                {'left': 'hotel', 'right': 'hotel'},
            ],
            4,
        ),
        _blank(
            'Complete the question',
            ['¿Dónde está la ', '?'],
            'estación',
            ['estación', 'manzana', 'gato', 'leche'],
            5,
        ),
        _type(
            'Write this in Spanish',
            'I need a taxi, please.',
            ['Necesito un taxi, por favor.', 'Necesito un taxi por favor.', 'necesito un taxi, por favor.'],
            6,
        ),
    ],
    2: [
        _mc(
            'What is the best response to "¿Dónde está el baño?"',
            'Where is the bathroom?',
            [
                {'text': 'Está a la derecha.', 'correct': True},
                {'text': 'Son las tres.', 'correct': False},
                {'text': 'Muchas gracias.', 'correct': False},
                {'text': 'Hace sol.', 'correct': False},
            ],
            1,
        ),
        _mc(
            'Select the correct translation for "turn left"',
            'turn left',
            [
                {'text': 'gira a la izquierda', 'correct': True},
                {'text': 'gira a la derecha', 'correct': False},
                {'text': 'sigue recto', 'correct': False},
                {'text': 'está cerca', 'correct': False},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'El hotel está cerca del aeropuerto.',
            ['The', 'hotel', 'is', 'near', 'the', 'airport.'],
            ['The', 'hotel', 'is', 'near', 'the', 'airport.', 'far', 'train', 'bus', 'from'],
            3,
        ),
        _pairs(
            'Match the directions',
            [
                {'left': 'a la derecha', 'right': 'to the right'},
                {'left': 'a la izquierda', 'right': 'to the left'},
                {'left': 'todo recto', 'right': 'straight ahead'},
                {'left': 'cerca', 'right': 'near'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['El mapa está en la ', '.'],
            'maleta',
            ['maleta', 'manzana', 'leche', 'gato'],
            5,
        ),
        _type(
            'Write this in English',
            '¿A qué hora sale el tren?',
            ['What time does the train leave?', 'What time does the train leave', 'At what time does the train leave?'],
            6,
        ),
    ],
}

NUMBERS = {
    1: [
        _mc(
            'What number is "quince"?',
            'quince',
            [
                {'text': '15', 'correct': True},
                {'text': '5', 'correct': False},
                {'text': '50', 'correct': False},
                {'text': '13', 'correct': False},
            ],
            1,
        ),
        _mc(
            'How do you say "twenty" in Spanish?',
            'twenty',
            [
                {'text': 'veinte', 'correct': True},
                {'text': 'doce', 'correct': False},
                {'text': 'treinta', 'correct': False},
                {'text': 'dieciocho', 'correct': False},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'Tengo ocho libros y tres bolígrafos.',
            ['I', 'have', 'eight', 'books', 'and', 'three', 'pens.'],
            ['I', 'have', 'eight', 'books', 'and', 'three', 'pens.', 'five', 'two', 'apples', 'ten'],
            3,
        ),
        _pairs(
            'Match the numbers',
            [
                {'left': 'siete', 'right': '7'},
                {'left': 'nueve', 'right': '9'},
                {'left': 'once', 'right': '11'},
                {'left': 'catorce', 'right': '14'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['Hay ', ' estudiantes en la clase.'],
            'veinticinco',
            ['veinticinco', 'pan', 'gato', 'hotel'],
            5,
        ),
        _type(
            'Write this in Spanish',
            'I am seventeen years old.',
            ['Tengo diecisiete años.', 'Tengo diecisiete anos.', 'tengo diecisiete años.'],
            6,
        ),
    ],
    2: [
        _mc(
            'What does "¿Cuánto cuesta?" mean?',
            '¿Cuánto cuesta?',
            [
                {'text': 'How much does it cost?', 'correct': True},
                {'text': 'How many are there?', 'correct': False},
                {'text': 'What time is it?', 'correct': False},
                {'text': 'Where is it?', 'correct': False},
            ],
            1,
        ),
        _mc(
            'Select the correct answer to "¿Cuántos años tienes?"',
            'I am 20 years old.',
            [
                {'text': 'Tengo veinte años.', 'correct': True},
                {'text': 'Tengo veinte libros.', 'correct': False},
                {'text': 'Son veinte años.', 'correct': False},
                {'text': 'Hay veinte años.', 'correct': False},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'El café cuesta tres euros.',
            ['The', 'coffee', 'costs', 'three', 'euros.'],
            ['The', 'coffee', 'costs', 'three', 'euros.', 'five', 'bread', 'ten', 'dollars'],
            3,
        ),
        _pairs(
            'Match the prices',
            [
                {'left': 'dos euros', 'right': '2 euros'},
                {'left': 'cinco dólares', 'right': '5 dollars'},
                {'left': 'cien pesos', 'right': '100 pesos'},
                {'left': 'mil', 'right': '1,000'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['Mi número de teléfono tiene ', ' dígitos.'],
            'nueve',
            ['nueve', 'perro', 'pan', 'hotel'],
            5,
        ),
        _type(
            'Write this in English',
            'Son las ocho y media.',
            ['It is eight thirty.', 'It is half past eight.', 'It\'s eight thirty.', "It's half past eight."],
            6,
        ),
    ],
}

QUESTIONS = {
    1: [
        _mc(
            'Which word makes a yes/no question?',
            'Do you speak Spanish?',
            [
                {'text': '¿Hablas español?', 'correct': True},
                {'text': 'Hablas español.', 'correct': False},
                {'text': 'Yo hablo español.', 'correct': False},
                {'text': 'Hablamos español.', 'correct': False},
            ],
            1,
        ),
        _mc(
            'What does "¿Qué?" mean?',
            '¿Qué?',
            [
                {'text': 'What?', 'correct': True},
                {'text': 'Who?', 'correct': False},
                {'text': 'Where?', 'correct': False},
                {'text': 'When?', 'correct': False},
            ],
            2,
        ),
        _translate(
            'Translate this question',
            '¿De dónde eres?',
            ['Where', 'are', 'you', 'from?'],
            ['Where', 'are', 'you', 'from?', 'What', 'is', 'your', 'name', 'How', 'old'],
            3,
        ),
        _pairs(
            'Match the question words',
            [
                {'left': '¿Qué?', 'right': 'What?'},
                {'left': '¿Quién?', 'right': 'Who?'},
                {'left': '¿Dónde?', 'right': 'Where?'},
                {'left': '¿Cuándo?', 'right': 'When?'},
            ],
            4,
        ),
        _blank(
            'Complete the question',
            ['¿', ' te llamas?'],
            'Cómo',
            ['Cómo', 'Dónde', 'Pan', 'Gato'],
            5,
        ),
        _type(
            'Write this in Spanish',
            'What is your name?',
            ['¿Cómo te llamas?', '¿Como te llamas?', 'cómo te llamas?'],
            6,
        ),
    ],
    2: [
        _mc(
            'Select the correct question',
            'Why are you late?',
            [
                {'text': '¿Por qué llegas tarde?', 'correct': True},
                {'text': '¿Para qué llegas tarde?', 'correct': False},
                {'text': '¿Porque llegas tarde?', 'correct': False},
                {'text': '¿Qué llegas tarde?', 'correct': False},
            ],
            1,
        ),
        _mc(
            'What is the best answer to "¿Cuál es tu color favorito?"',
            'My favorite color is blue.',
            [
                {'text': 'Mi color favorito es azul.', 'correct': True},
                {'text': 'Me gusta comer azul.', 'correct': False},
                {'text': 'Soy azul.', 'correct': False},
                {'text': 'Tengo azul.', 'correct': False},
            ],
            2,
        ),
        _translate(
            'Translate this question',
            '¿A qué hora abre la tienda?',
            ['What', 'time', 'does', 'the', 'store', 'open?'],
            ['What', 'time', 'does', 'the', 'store', 'open?', 'close', 'Where', 'is', 'the', 'hotel'],
            3,
        ),
        _pairs(
            'Match the questions and meanings',
            [
                {'left': '¿Cuánto?', 'right': 'How much?'},
                {'left': '¿Cuántos?', 'right': 'How many?'},
                {'left': '¿Cuál?', 'right': 'Which?'},
                {'left': '¿Por qué?', 'right': 'Why?'},
            ],
            4,
        ),
        _blank(
            'Complete the question',
            ['¿', ' años tienes?'],
            'Cuántos',
            ['Cuántos', 'Cuánto', 'Qué', 'Dónde'],
            5,
        ),
        _type(
            'Write this in English',
            '¿Entiendes la pregunta?',
            ['Do you understand the question?', 'Do you understand the question', 'do you understand the question?'],
            6,
        ),
    ],
}

# ---------------------------------------------------------------------------
# UNIT 4 — Hobbies, weather, family
# ---------------------------------------------------------------------------

HOBBIES = {
    1: [
        _mc(
            'How do you say "I like to read"?',
            'I like to read',
            [
                {'text': 'Me gusta leer.', 'correct': True, 'image': 'book'},
                {'text': 'Me gusta correr.', 'correct': False},
                {'text': 'Me gusta cantar.', 'correct': False},
                {'text': 'Me gusta nadar.', 'correct': False},
            ],
            1,
        ),
        _mc(
            'What does "tocar la guitarra" mean?',
            'tocar la guitarra',
            [
                {'text': 'to play the guitar', 'correct': True, 'image': 'music'},
                {'text': 'to listen to music', 'correct': False, 'image': 'music'},
                {'text': 'to dance', 'correct': False},
                {'text': 'to watch TV', 'correct': False},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'Me gusta jugar al fútbol los sábados.',
            ['I', 'like', 'to', 'play', 'soccer', 'on', 'Saturdays.'],
            ['I', 'like', 'to', 'play', 'soccer', 'on', 'Saturdays.', 'swim', 'Sundays', 'read', 'music'],
            3,
        ),
        _pairs(
            'Match the hobbies',
            [
                {'left': 'leer', 'right': 'to read'},
                {'left': 'bailar', 'right': 'to dance'},
                {'left': 'nadar', 'right': 'to swim'},
                {'left': 'pintar', 'right': 'to paint'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['A ella le gusta ', ' en el parque.'],
            'correr',
            ['correr', 'pan', 'hotel', 'tren'],
            5,
        ),
        _type(
            'Write this in Spanish',
            'We like to watch movies.',
            ['Nos gusta ver películas.', 'Nos gusta ver peliculas.', 'nos gusta ver películas.'],
            6,
        ),
    ],
    2: [
        _mc(
            'Select the correct sentence',
            'They enjoy playing video games.',
            [
                {'text': 'Les gusta jugar videojuegos.', 'correct': True},
                {'text': 'Les gusta jugar al libro.', 'correct': False},
                {'text': 'Le gusta jugar videojuegos.', 'correct': False},
                {'text': 'Les gustan jugar videojuegos.', 'correct': False},
            ],
            1,
        ),
        _mc(
            'What does "los fines de semana" mean?',
            'los fines de semana',
            [
                {'text': 'on the weekends', 'correct': True},
                {'text': 'every morning', 'correct': False},
                {'text': 'at night', 'correct': False},
                {'text': 'during the week', 'correct': False},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'Prefiero escuchar música y dibujar.',
            ['I', 'prefer', 'to', 'listen', 'to', 'music', 'and', 'draw.'],
            ['I', 'prefer', 'to', 'listen', 'to', 'music', 'and', 'draw.', 'run', 'read', 'swim', 'cook'],
            3,
        ),
        _pairs(
            'Match the free-time phrases',
            [
                {'left': 'ver la tele', 'right': 'watch TV'},
                {'left': 'salir con amigos', 'right': 'go out with friends'},
                {'left': 'hacer ejercicio', 'right': 'exercise'},
                {'left': 'cocinar', 'right': 'to cook'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['Me encanta ', ' fotos.'],
            'tomar',
            ['tomar', 'beber', 'pan', 'gato'],
            5,
        ),
        _type(
            'Write this in English',
            '¿Te gusta bailar?',
            ['Do you like to dance?', 'Do you like dancing?', 'Do you like to dance', 'Do you like dancing'],
            6,
        ),
    ],
}

WEATHER = {
    1: [
        _mc(
            'How do you say "It is sunny today"?',
            'It is sunny today.',
            [
                {'text': 'Hoy hace sol.', 'correct': True, 'image': 'sun'},
                {'text': 'Hoy hace frío.', 'correct': False, 'image': 'snow'},
                {'text': 'Hoy llueve.', 'correct': False, 'image': 'rain'},
                {'text': 'Hoy hace viento.', 'correct': False},
            ],
            1,
        ),
        _mc(
            'What does "Está nublado" mean?',
            'Está nublado',
            [
                {'text': 'It is cloudy', 'correct': True},
                {'text': 'It is hot', 'correct': False},
                {'text': 'It is snowing', 'correct': False},
                {'text': 'It is windy', 'correct': False},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'En invierno hace mucho frío.',
            ['In', 'winter', 'it', 'is', 'very', 'cold.'],
            ['In', 'winter', 'it', 'is', 'very', 'cold.', 'summer', 'hot', 'rainy', 'spring'],
            3,
        ),
        _pairs(
            'Match the weather words',
            [
                {'left': 'sol', 'right': 'sun'},
                {'left': 'lluvia', 'right': 'rain'},
                {'left': 'nieve', 'right': 'snow'},
                {'left': 'viento', 'right': 'wind'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['En verano hace ', '.'],
            'calor',
            ['calor', 'leche', 'perro', 'libro'],
            5,
        ),
        _type(
            'Write this in Spanish',
            'It is raining today.',
            ['Hoy llueve.', 'Hoy llueve', 'hoy llueve.'],
            6,
        ),
    ],
    2: [
        _mc(
            'Select the best response to "¿Qué tiempo hace?"',
            'What is the weather like?',
            [
                {'text': 'Hace buen tiempo.', 'correct': True},
                {'text': 'Son las dos.', 'correct': False},
                {'text': 'Estoy cansado.', 'correct': False},
                {'text': 'Voy al cine.', 'correct': False},
            ],
            1,
        ),
        _mc(
            'What season is "la primavera"?',
            'spring',
            [
                {'text': 'spring', 'correct': True},
                {'text': 'summer', 'correct': False},
                {'text': 'autumn', 'correct': False},
                {'text': 'winter', 'correct': False},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'Mañana va a nevar en las montañas.',
            ['Tomorrow', 'it', 'is', 'going', 'to', 'snow', 'in', 'the', 'mountains.'],
            ['Tomorrow', 'it', 'is', 'going', 'to', 'snow', 'in', 'the', 'mountains.', 'rain', 'today', 'beach', 'hot'],
            3,
        ),
        _pairs(
            'Match the seasons',
            [
                {'left': 'primavera', 'right': 'spring'},
                {'left': 'verano', 'right': 'summer'},
                {'left': 'otoño', 'right': 'autumn'},
                {'left': 'invierno', 'right': 'winter'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['Cuando ', ', llevo un paraguas.'],
            'llueve',
            ['llueve', 'corro', 'como', 'soy'],
            5,
        ),
        _type(
            'Write this in English',
            'Hace viento pero no llueve.',
            ['It is windy but it is not raining.', 'It is windy but not raining.', "It's windy but it's not raining."],
            6,
        ),
    ],
}

FAMILY = {
    1: [
        _mc(
            'What is "my mother" in Spanish?',
            'my mother',
            [
                {'text': 'mi madre', 'correct': True, 'image': 'woman'},
                {'text': 'mi padre', 'correct': False, 'image': 'man'},
                {'text': 'mi hermana', 'correct': False, 'image': 'girl'},
                {'text': 'mi abuela', 'correct': False},
            ],
            1,
        ),
        _mc(
            'Select the correct translation for "grandfather"',
            'grandfather',
            [
                {'text': 'abuelo', 'correct': True},
                {'text': 'abuela', 'correct': False},
                {'text': 'tío', 'correct': False},
                {'text': 'primo', 'correct': False},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'Mi hermano mayor vive en México.',
            ['My', 'older', 'brother', 'lives', 'in', 'Mexico.'],
            ['My', 'older', 'brother', 'lives', 'in', 'Mexico.', 'sister', 'Spain', 'works', 'younger'],
            3,
        ),
        _pairs(
            'Match the family words',
            [
                {'left': 'padre', 'right': 'father'},
                {'left': 'madre', 'right': 'mother'},
                {'left': 'hermano', 'right': 'brother'},
                {'left': 'hermana', 'right': 'sister'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['Mi ', ' se llama Carmen.'],
            'abuela',
            ['abuela', 'perro', 'café', 'tren'],
            5,
        ),
        _type(
            'Write this in Spanish',
            'I love my family.',
            ['Amo a mi familia.', 'Quiero a mi familia.', 'amo a mi familia.', 'quiero a mi familia.'],
            6,
        ),
    ],
    2: [
        _mc(
            'What does "los primos" mean?',
            'los primos',
            [
                {'text': 'the cousins', 'correct': True, 'image': 'family'},
                {'text': 'the parents', 'correct': False, 'image': 'family'},
                {'text': 'the neighbors', 'correct': False},
                {'text': 'the children', 'correct': False},
            ],
            1,
        ),
        _mc(
            'Select the correct sentence',
            'Her parents are very kind.',
            [
                {'text': 'Sus padres son muy amables.', 'correct': True},
                {'text': 'Su padres son muy amables.', 'correct': False},
                {'text': 'Sus padres es muy amables.', 'correct': False},
                {'text': 'Sus padres son muy amable.', 'correct': False},
            ],
            2,
        ),
        _translate(
            'Translate this sentence',
            'Tengo dos hijos y una hija.',
            ['I', 'have', 'two', 'sons', 'and', 'one', 'daughter.'],
            ['I', 'have', 'two', 'sons', 'and', 'one', 'daughter.', 'brothers', 'three', 'parents', 'children'],
            3,
        ),
        _pairs(
            'Match the relatives',
            [
                {'left': 'tío', 'right': 'uncle'},
                {'left': 'tía', 'right': 'aunt'},
                {'left': 'esposo', 'right': 'husband'},
                {'left': 'esposa', 'right': 'wife'},
            ],
            4,
        ),
        _blank(
            'Complete the sentence',
            ['Mi familia es muy ', '.'],
            'grande',
            ['grande', 'leche', 'autobús', 'nieve'],
            5,
        ),
        _type(
            'Write this in English',
            '¿Cuántas personas hay en tu familia?',
            ['How many people are in your family?', 'How many people are in your family', 'How many people are there in your family?'],
            6,
        ),
    ],
}


EXERCISES_BY_SKILL = {
    'Basics 1': BASICS_1,
    'Phrases': PHRASES,
    'Basics 2': BASICS_2,
    'Food': FOOD,
    'Animals': ANIMALS,
    'Plurals': PLURALS,
    'Travel': TRAVEL,
    'Numbers': NUMBERS,
    'Questions': QUESTIONS,
    'Hobbies': HOBBIES,
    'Weather': WEATHER,
    'Family': FAMILY,
}


def get_exercises_for_lesson(skill_title: str, lesson_order: int):
    """Return exercise dicts for a skill lesson, or a Basics 1 fallback."""
    skill_lessons = EXERCISES_BY_SKILL.get(skill_title)
    if not skill_lessons:
        skill_lessons = BASICS_1
    return skill_lessons.get(lesson_order, skill_lessons.get(1, []))
