import { saveAs } from 'file-saver';
import type { QuizSet } from '../types';
import { validateQuizSet } from '../utils/validation';
import type { ValidationError } from '../utils/validation';

/**
 * Set Management Service
 * Handles import/export of quiz sets
 */
export class SetService {
  /**
   * Exports a quiz set as JSON file
   */
  static exportSet(set: QuizSet): void {
    const json = JSON.stringify(set, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    // Use set name instead of id, sanitize for filename
    const safeName = (set.name || 'quiz-set')
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
    const fileName = `${safeName}.json`;
    saveAs(blob, fileName);
  }

  /**
   * Imports a quiz set from JSON file
   */
  static async importSet(file: File): Promise<{ set: QuizSet | null; errors: ValidationError[] }> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate the set
      const errors = validateQuizSet(data);
      
      if (errors.length > 0) {
        return { set: null, errors };
      }

      return { set: data as QuizSet, errors: [] };
    } catch (error) {
      return {
        set: null,
        errors: [{ field: 'file', message: 'Invalid JSON file or file reading error' }],
      };
    }
  }

  /**
   * Exports multiple sets as JSON file
   */
  static exportMultipleSets(sets: QuizSet[]): void {
    const json = JSON.stringify(sets, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'quiz-sets.json');
  }

  /**
   * Creates a sample quiz set for demonstration
   */
  static createSampleSet(): QuizSet {
    return {
      id: 'sample-set-001',
      name: 'Örnek Genel Kültür Seti',
      description: 'Örnek bir bilgi yarışması seti',
      finalRoundEnabled: true,
      categories: [
        {
          id: 'sports',
          title: 'Spor',
          questionsByPoint: {
            100: [
              {
                id: 'sports-100-1',
                categoryId: 'sports',
                point: 100,
                questionText: "Süper Lig'de en çok şampiyon olan takım hangisidir?",
                options: [
                  { id: 'a', text: 'Fenerbahçe' },
                  { id: 'b', text: 'Galatasaray' },
                  { id: 'c', text: 'Beşiktaş' },
                  { id: 'd', text: 'Trabzonspor' },
                ],
                correctOptionId: 'b',
                explanation: 'Galatasaray en çok şampiyonluk kazanan takımdır.',
              },
            ],
            200: [
              {
                id: 'sports-200-1',
                categoryId: 'sports',
                point: 200,
                questionText: 'Basketbolda bir takımda kaç oyuncu sahada bulunur?',
                options: [
                  { id: 'a', text: '5' },
                  { id: 'b', text: '6' },
                  { id: 'c', text: '7' },
                  { id: 'd', text: '11' },
                ],
                correctOptionId: 'a',
                explanation: 'Basketbolda her takımdan 5 oyuncu sahada bulunur.',
              },
            ],
            300: [
              {
                id: 'sports-300-1',
                categoryId: 'sports',
                point: 300,
                questionText: 'Wimbledon Tenis Turnuvası hangi zeminde oynanır?',
                options: [
                  { id: 'a', text: 'Toprak kort' },
                  { id: 'b', text: 'Çim kort' },
                  { id: 'c', text: 'Sert kort' },
                  { id: 'd', text: 'Sentetik kort' },
                ],
                correctOptionId: 'b',
                explanation: 'Wimbledon çim kortlarda oynanır.',
              },
            ],
            400: [
              {
                id: 'sports-400-1',
                categoryId: 'sports',
                point: 400,
                questionText: 'Formula 1 tarihinde en çok şampiyonluk kazanan pilot kimdir?',
                options: [
                  { id: 'a', text: 'Lewis Hamilton' },
                  { id: 'b', text: 'Michael Schumacher' },
                  { id: 'c', text: 'Ayrton Senna' },
                  { id: 'd', text: 'Sebastian Vettel' },
                ],
                correctOptionId: 'b',
                explanation: 'Michael Schumacher 7 dünya şampiyonluğu ile rekor sahibidir.',
              },
            ],
            500: [
              {
                id: 'sports-500-1',
                categoryId: 'sports',
                point: 500,
                questionText: 'Olimpiyat oyunları ilk olarak hangi yıl düzenlenmiştir?',
                options: [
                  { id: 'a', text: '1896' },
                  { id: 'b', text: '1900' },
                  { id: 'c', text: '1888' },
                  { id: 'd', text: '1904' },
                ],
                correctOptionId: 'a',
                explanation: 'Modern olimpiyatlar ilk kez 1896 yılında Atina\'da düzenlenmiştir.',
              },
            ],
          },
        },
        // Generate 9 more placeholder categories
        ...Array.from({ length: 9 }, (_, i) => ({
          id: `category-${i + 2}`,
          title: `Kategori ${i + 2}`,
          questionsByPoint: {
            100: [
              {
                id: `cat${i + 2}-100-1`,
                categoryId: `category-${i + 2}`,
                point: 100,
                questionText: `Kategori ${i + 2} - 100 puan sorusu?`,
                options: [
                  { id: 'a', text: 'Seçenek A' },
                  { id: 'b', text: 'Seçenek B' },
                  { id: 'c', text: 'Seçenek C' },
                  { id: 'd', text: 'Seçenek D' },
                ],
                correctOptionId: 'a',
                explanation: 'Doğru cevap A seçeneğidir.',
              },
            ],
            200: [
              {
                id: `cat${i + 2}-200-1`,
                categoryId: `category-${i + 2}`,
                point: 200,
                questionText: `Kategori ${i + 2} - 200 puan sorusu?`,
                options: [
                  { id: 'a', text: 'Seçenek A' },
                  { id: 'b', text: 'Seçenek B' },
                  { id: 'c', text: 'Seçenek C' },
                  { id: 'd', text: 'Seçenek D' },
                ],
                correctOptionId: 'b',
                explanation: 'Doğru cevap B seçeneğidir.',
              },
            ],
            300: [
              {
                id: `cat${i + 2}-300-1`,
                categoryId: `category-${i + 2}`,
                point: 300,
                questionText: `Kategori ${i + 2} - 300 puan sorusu?`,
                options: [
                  { id: 'a', text: 'Seçenek A' },
                  { id: 'b', text: 'Seçenek B' },
                  { id: 'c', text: 'Seçenek C' },
                  { id: 'd', text: 'Seçenek D' },
                ],
                correctOptionId: 'c',
                explanation: 'Doğru cevap C seçeneğidir.',
              },
            ],
            400: [
              {
                id: `cat${i + 2}-400-1`,
                categoryId: `category-${i + 2}`,
                point: 400,
                questionText: `Kategori ${i + 2} - 400 puan sorusu?`,
                options: [
                  { id: 'a', text: 'Seçenek A' },
                  { id: 'b', text: 'Seçenek B' },
                  { id: 'c', text: 'Seçenek C' },
                  { id: 'd', text: 'Seçenek D' },
                ],
                correctOptionId: 'd',
                explanation: 'Doğru cevap D seçeneğidir.',
              },
            ],
            500: [
              {
                id: `cat${i + 2}-500-1`,
                categoryId: `category-${i + 2}`,
                point: 500,
                questionText: `Kategori ${i + 2} - 500 puan sorusu?`,
                options: [
                  { id: 'a', text: 'Seçenek A' },
                  { id: 'b', text: 'Seçenek B' },
                  { id: 'c', text: 'Seçenek C' },
                  { id: 'd', text: 'Seçenek D' },
                ],
                correctOptionId: 'a',
                explanation: 'Doğru cevap A seçeneğidir.',
              },
            ],
          },
        })),
      ],
      finalRoundQuestions: [
        {
          id: 'final-1',
          questionText: "Türkiye'nin yüzölçümü yaklaşık kaç km²'dir?",
          correctAnswer: 783562,
          explanation: "Türkiye'nin yüzölçümü yaklaşık 783.562 km²'dir.",
        },
        {
          id: 'final-2',
          questionText: 'İstanbul hangi yıl Avrupa Kültür Başkenti seçilmiştir?',
          correctAnswer: 2010,
          explanation: 'İstanbul 2010 yılında Avrupa Kültür Başkenti seçilmiştir.',
        },
        {
          id: 'final-3',
          questionText: 'Dünya üzerinde kaç ülke vardır? (BM üyesi)',
          correctAnswer: 193,
          explanation: 'BM üyesi 193 ülke vardır.',
        },
        {
          id: 'final-4',
          questionText: 'İnsan vücudunda kaç kemik vardır?',
          correctAnswer: 206,
          explanation: 'Yetişkin insan vücudunda 206 kemik vardır.',
        },
        {
          id: 'final-5',
          questionText: 'Ay dünyadan yaklaşık kaç km uzaklıktadır?',
          correctAnswer: 384400,
          explanation: 'Ay dünyadan ortalama 384.400 km uzaklıktadır.',
        },
      ],
    };
  }
}
