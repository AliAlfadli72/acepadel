<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CourtsSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing courts first
        DB::table('courts')->truncate();

        $courts = [
            [
                'name'        => 'ملعب الماس',
                'type'        => 'indoor',
                'price'       => 15000,
                'description' => 'ملعب داخلي مميز بأرضية احترافية مطابقة لمعايير FIP.',
                'is_active'   => true,
                'image_path'  => null,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'name'        => 'ملعب زمرد',
                'type'        => 'indoor',
                'price'       => 15000,
                'description' => 'ملعب داخلي بإضاءة ممتازة وسعة تستوعب المتفرجين.',
                'is_active'   => true,
                'image_path'  => null,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'name'        => 'ملعب عقيق',
                'type'        => 'outdoor',
                'price'       => 12000,
                'description' => 'ملعب خارجي بإطلالة رائعة، مجهز لكل الأجواء.',
                'is_active'   => true,
                'image_path'  => null,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'name'        => 'ملعب ذهب',
                'type'        => 'outdoor',
                'price'       => 12000,
                'description' => 'ملعب خارجي واسع مثالي للبطولات والمباريات الترفيهية.',
                'is_active'   => true,
                'image_path'  => null,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'name'        => 'ملعب فضة',
                'type'        => 'indoor',
                'price'       => 10000,
                'description' => 'ملعب داخلي مثالي للتدريبات والمباريات الودية.',
                'is_active'   => true,
                'image_path'  => null,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'name'        => 'ملعب بلاتين',
                'type'        => 'outdoor',
                'price'       => 10000,
                'description' => 'ملعب خارجي بأسعار مناسبة ومرافق متكاملة.',
                'is_active'   => true,
                'image_path'  => null,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ];

        DB::table('courts')->insert($courts);
    }
}
