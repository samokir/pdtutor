import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Operation = '+' | '-' | '×';

type Question = {
  first: number;
  second: number;
  operation: Operation;
  answer: number;
  choices: number[];
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createQuestion(): Question {
  const operations: Operation[] = ['+', '-', '×'];
  const operation = operations[randomInt(0, operations.length - 1)];
  let first = randomInt(0, 99);
  let second = randomInt(0, 99);

  if (operation === '-' && second > first) {
    [first, second] = [second, first];
  }

  const answer =
    operation === '+' ? first + second : operation === '-' ? first - second : first * second;
  const maxAnswer = operation === '+' ? 198 : operation === '-' ? 99 : 9801;
  const choices = new Set([answer]);

  while (choices.size < 3) {
    const distance = randomInt(1, 12);
    const direction = Math.random() < 0.5 ? -1 : 1;
    let distractor = answer + distance * direction;

    if (distractor < 0 || distractor > maxAnswer) {
      distractor = answer - distance * direction;
    }
    if (distractor < 0 || distractor > maxAnswer || choices.has(distractor)) {
      distractor = randomInt(0, maxAnswer);
    }

    choices.add(distractor);
  }

  const shuffledChoices = Array.from(choices);
  for (let index = shuffledChoices.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [shuffledChoices[index], shuffledChoices[swapIndex]] = [
      shuffledChoices[swapIndex],
      shuffledChoices[index],
    ];
  }

  return { first, second, operation, answer, choices: shuffledChoices };
}

export default function HomeScreen() {
  const [question, setQuestion] = useState(createQuestion);
  const [feedback, setFeedback] = useState<'correct' | 'try-again' | null>(null);
  const [score, setScore] = useState(0);

  function chooseAnswer(choice: number) {
    if (choice === question.answer) {
      setScore((currentScore) => currentScore + 1);
      setFeedback('correct');
      setQuestion(createQuestion());
      return;
    }

    setFeedback('try-again');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>THE BRAIN GYM</Text>
              <Text style={styles.title}>Math level 3</Text>
            </View>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreLabel}>STARS</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>
          </View>

          <View style={styles.questionPanel}>
            <View style={styles.questionLabelRow}>
              <View style={styles.questionDot} />
              <Text style={styles.questionLabel}>YOUR QUESTION</Text>
            </View>
            <Text style={styles.questionText}>
              {question.first} {question.operation} {question.second}
            </Text>
            <View style={styles.answerLine} />
          </View>

          <View style={styles.choices}>
            {question.choices.map((choice, index) => (
              <Pressable
                key={`${question.first}-${question.operation}-${question.second}-${index}`}
                accessibilityRole="button"
                accessibilityLabel={`${String.fromCharCode(97 + index)}: ${choice}`}
                onPress={() => chooseAnswer(choice)}
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
                <Text style={styles.choiceText}>{choice}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eyebrow: {
    color: '#548167',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 5,
  },
  title: {
    color: '#183A2A',
    fontSize: 32,
    fontWeight: '900',
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
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
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
    fontSize: 23,
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
