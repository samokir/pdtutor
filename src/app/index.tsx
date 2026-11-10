import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Operation = '+' | '-' | '×' | '/';
type QuizMode = 'operations' | 'comparison';

type Choice = {
  value: string;
  label: string;
};

type Question = {
  instruction: string;
  prompt: string;
  answer: string;
  choices: Choice[];
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(values: T[]) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
  return values;
}

function createChoices(answer: string, candidates: string[]): Choice[] {
  const values = new Set([answer]);

  while (values.size < 3) {
    values.add(candidates[randomInt(0, candidates.length - 1)]);
  }

  return shuffle(Array.from(values)).map((value) => ({ value, label: value }));
}

function createOperationQuestion(): Question {
  const operations: Operation[] = ['+', '-', '×', '/'];
  const operation = operations[randomInt(0, operations.length - 1)];
  let first: number;
  let second: number;
  let answer: number;

  if (operation === '/') {
    second = randomInt(1, 10);
    answer = randomInt(1, 10);
    first = second * answer;
  } else {
    const operandMax = operation === '×' ? 10 : 100;
    first = randomInt(0, operandMax);
    second = randomInt(0, operandMax);

    if (operation === '-' && second > first) {
      [first, second] = [second, first];
    }

    answer = operation === '+' ? first + second : operation === '-' ? first - second : first * second;
  }

  const maxAnswer = operation === '+' ? 200 : operation === '×' ? 100 : operation === '/' ? 10 : 100;
  const candidates = Array.from({ length: maxAnswer + 1 }, (_, value) => String(value));

  return {
    instruction: 'РЕШИ ПРИМЕР',
    prompt: `${first} ${operation} ${second}`,
    answer: String(answer),
    choices: createChoices(String(answer), candidates),
  };
}

function createComparisonQuestion(): Question {
  const questionType = randomInt(0, 2);

  if (questionType === 0) {
    const first = randomInt(0, 1000);
    const second = randomInt(0, 1000);
    const answer = first < second ? '<' : first > second ? '>' : '=';
    const choices: Choice[] = shuffle([
      { value: '<', label: '<  меньше' },
      { value: '=', label: '=  равно' },
      { value: '>', label: '>  больше' },
    ]);

    return {
      instruction: 'ВЫБЕРИ ЗНАК',
      prompt: `${first}   ?   ${second}`,
      answer,
      choices,
    };
  }

  if (questionType === 1) {
    const first = randomInt(0, 100);
    let second = randomInt(0, 100);
    while (second === first) {
      second = randomInt(0, 100);
    }

    const difference = Math.abs(first - second);
    const answer = first < second ? `меньше на ${difference}` : `больше на ${difference}`;
    const candidates = Array.from({ length: 100 }, (_, index) => index + 1).flatMap((value) => [
      `меньше на ${value}`,
      `больше на ${value}`,
    ]);

    return {
      instruction: 'НА СКОЛЬКО ОТЛИЧАЮТСЯ?',
      prompt: `${first} и ${second}`,
      answer,
      choices: createChoices(answer, candidates),
    };
  }

  const factor = randomInt(2, 100);
  const smaller = randomInt(1, Math.floor(100 / factor));
  const larger = smaller * factor;
  const isFirstSmaller = Math.random() < 0.5;
  const first = isFirstSmaller ? smaller : larger;
  const second = isFirstSmaller ? larger : smaller;
  const answer = isFirstSmaller ? `меньше в ${factor} раз` : `больше в ${factor} раз`;
  const candidates = Array.from({ length: 99 }, (_, index) => index + 2).flatMap((value) => [
    `меньше в ${value} раз`,
    `больше в ${value} раз`,
  ]);

  return {
    instruction: 'ВО СКОЛЬКО РАЗ ОТЛИЧАЮТСЯ?',
    prompt: `${first} и ${second}`,
    answer,
    choices: createChoices(answer, candidates),
  };
}

export default function HomeScreen() {
  const [quizMode, setQuizMode] = useState<QuizMode>('operations');
  const [question, setQuestion] = useState(createOperationQuestion);
  const [feedback, setFeedback] = useState<'correct' | 'try-again' | null>(null);
  const [score, setScore] = useState(0);

  function selectQuiz(mode: QuizMode) {
    if (mode === quizMode) {
      return;
    }

    setQuizMode(mode);
    setQuestion(mode === 'operations' ? createOperationQuestion() : createComparisonQuestion());
    setFeedback(null);
    setScore(0);
  }

  function chooseAnswer(choice: string) {
    if (choice === question.answer) {
      setScore((currentScore) => currentScore + 1);
      setFeedback('correct');
      setQuestion(quizMode === 'operations' ? createOperationQuestion() : createComparisonQuestion());
      return;
    }

    setFeedback('try-again');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              accessibilityLabel="Считайка"
              source={require('@/assets/images/calc-logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreLabel}>STARS</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>
          </View>

          <View style={styles.quizSelector}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Сложение / умножение"
              accessibilityState={{ selected: quizMode === 'operations' }}
              onPress={() => selectQuiz('operations')}
              style={[styles.quizOption, quizMode === 'operations' && styles.quizOptionSelected]}>
              <Image
                source={require('@/assets/images/sum-mult.png')}
                style={styles.quizImage}
                contentFit="contain"
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Больше / меньше"
              accessibilityState={{ selected: quizMode === 'comparison' }}
              onPress={() => selectQuiz('comparison')}
              style={[styles.quizOption, quizMode === 'comparison' && styles.quizOptionSelected]}>
              <Image
                source={require('@/assets/images/more-less.png')}
                style={styles.quizImage}
                contentFit="contain"
              />
            </Pressable>
          </View>

          <View style={styles.questionPanel}>
            <View style={styles.questionLabelRow}>
              <View style={styles.questionDot} />
              <Text style={styles.questionLabel}>{question.instruction}</Text>
            </View>
            <Text style={[styles.questionText, question.prompt.length > 13 && styles.questionTextLong]}>
              {question.prompt}
            </Text>
            <View style={styles.answerLine} />
          </View>

          <View style={styles.choices}>
            {question.choices.map((choice, index) => (
              <Pressable
                key={`${question.prompt}-${choice.value}-${index}`}
                accessibilityRole="button"
                accessibilityLabel={`${String.fromCharCode(97 + index)}: ${choice.label}`}
                onPress={() => chooseAnswer(choice.value)}
                style={({ pressed }) => [styles.choiceButton, pressed && styles.choicePressed]}>
                <View
                  style={[
                    styles.choiceLetter,
                    index === 0
                      ? styles.choiceLetter0
                      : index === 1
                        ? styles.choiceLetter1
                        : styles.choiceLetter2,
                  ]}>
                  <Text style={styles.choiceLetterText}>{String.fromCharCode(97 + index)})</Text>
                </View>
                <Text style={styles.choiceText}>{choice.label}</Text>
                <Text style={styles.choiceArrow}>›</Text>
              </Pressable>
            ))}
          </View>

          <View
            accessibilityLiveRegion="polite"
            style={[
              styles.feedback,
              feedback === 'correct' && styles.feedbackCorrect,
              feedback === 'try-again' && styles.feedbackTryAgain,
            ]}>
            <Text style={styles.feedbackText}>
              {feedback === 'correct'
                ? 'You are the best!'
                : feedback === 'try-again'
                  ? 'Try again!'
                  : 'Pick the right answer'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EFF8F1',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  content: {
    width: '100%',
    maxWidth: 520,
    gap: 20,
  },
  logo: {
    width: '68%',
    maxWidth: 220,
    aspectRatio: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  quizSelector: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#DDEBE1',
    borderRadius: 17,
    padding: 4,
  },
  quizOption: {
    flex: 1,
    minHeight: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    paddingHorizontal: 4,
  },
  quizOptionSelected: {
    backgroundColor: '#295B40',
  },
  quizImage: {
    width: 68,
    height: 68,
  },
  scoreBadge: {
    minWidth: 68,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD66B',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    transform: [{ rotate: '4deg' }],
  },
  scoreLabel: {
    color: '#6A4A00',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scoreValue: {
    color: '#493400',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 23,
  },
  questionPanel: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9EADF',
    borderWidth: 1,
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 24,
    shadowColor: '#25533A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  questionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  questionDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#F27654',
  },
  questionLabel: {
    color: '#71907D',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  questionText: {
    color: '#183A2A',
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
  },
  questionTextLong: {
    fontSize: 32,
  },
  answerLine: {
    width: 58,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#F7C84D',
    marginTop: 16,
  },
  choices: {
    gap: 10,
  },
  choiceButton: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DAE8DE',
    borderWidth: 1,
    borderRadius: 17,
    paddingHorizontal: 14,
  },
  choicePressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
  choiceLetter: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    marginRight: 13,
  },
  choiceLetter0: {
    backgroundColor: '#FCE1D8',
  },
  choiceLetter1: {
    backgroundColor: '#DCECF8',
  },
  choiceLetter2: {
    backgroundColor: '#E6E9C9',
  },
  choiceLetterText: {
    color: '#183A2A',
    fontSize: 16,
    fontWeight: '900',
  },
  choiceText: {
    flex: 1,
    color: '#234A35',
    fontSize: 18,
    fontWeight: '800',
  },
  choiceArrow: {
    color: '#92AA9A',
    fontSize: 29,
    lineHeight: 32,
  },
  feedback: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E1EFE5',
    borderRadius: 17,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  feedbackCorrect: {
    backgroundColor: '#BFECCB',
  },
  feedbackTryAgain: {
    backgroundColor: '#FFE7A0',
  },
  feedbackText: {
    color: '#214832',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
});
