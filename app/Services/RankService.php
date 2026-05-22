<?php

namespace App\Services;

/**
 * RankService — حساب المستوى تلقائياً بناءً على النقاط
 *
 * النقاط      → المستوى
 * 0   – 99    → مبتدئ  (D)
 * 100 – 299   → متوسط  (C)
 * 300 – 599   → متقدم  (B)
 * 600 – 999   → محترف  (A)
 * 1000+       → نخبة   (S)
 */
class RankService
{
    /** جدول المستويات مرتب تصاعدياً */
    public const TIERS = [
        ['min' => 1000, 'label' => 'نخبة',   'letter' => 'S'],
        ['min' => 600,  'label' => 'محترف',  'letter' => 'A'],
        ['min' => 300,  'label' => 'متقدم',  'letter' => 'B'],
        ['min' => 100,  'label' => 'متوسط',  'letter' => 'C'],
        ['min' => 0,    'label' => 'مبتدئ',  'letter' => 'D'],
    ];

    /**
     * يرجع label المستوى (مبتدئ / متوسط / ...) بناءً على النقاط.
     */
    public static function getLevelLabel(int $points): string
    {
        foreach (self::TIERS as $tier) {
            if ($points >= $tier['min']) {
                return $tier['label'];
            }
        }
        return 'مبتدئ';
    }

    /**
     * يرجع حرف المستوى (D / C / B / A / S) بناءً على النقاط.
     */
    public static function getLevelLetter(int $points): string
    {
        foreach (self::TIERS as $tier) {
            if ($points >= $tier['min']) {
                return $tier['letter'];
            }
        }
        return 'D';
    }

    /**
     * يرجع النقاط المطلوبة للمستوى التالي (أو null إذا كان في أعلى مستوى).
     */
    public static function getNextLevelPoints(int $points): ?int
    {
        $tiers = array_reverse(self::TIERS); // ترتيب تصاعدي من الأدنى
        foreach ($tiers as $tier) {
            if ($tier['min'] > $points) {
                return $tier['min'];
            }
        }
        return null; // أعلى مستوى
    }

    /**
     * يرجع نسبة التقدم نحو المستوى التالي (0.0 – 1.0).
     */
    public static function getProgress(int $points): float
    {
        $tiers = array_reverse(self::TIERS);

        $currentMin = 0;
        $nextMin    = null;

        foreach ($tiers as $i => $tier) {
            if ($points >= $tier['min']) {
                $currentMin = $tier['min'];
                $nextMin    = $tiers[$i + 1]['min'] ?? null;
                break;
            }
        }

        if ($nextMin === null) {
            return 1.0; // وصل للقمة
        }

        $range    = $nextMin - $currentMin;
        $progress = ($points - $currentMin) / $range;

        return round(min(max($progress, 0.0), 1.0), 4);
    }

    /**
     * يرجع كامل المعلومات كـ array.
     */
    public static function getInfo(int $points): array
    {
        return [
            'label'       => self::getLevelLabel($points),
            'letter'      => self::getLevelLetter($points),
            'next_points' => self::getNextLevelPoints($points),
            'progress'    => self::getProgress($points),
        ];
    }
}
