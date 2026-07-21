<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasRoles, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'image_path',
        'otp_code',
        'otp_expires_at',
        'phone_verified_at',
        'password',
        'fcm_token',
        'notif_bookings',
        'notif_events',
        'notif_offers',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'otp_code',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at'  => 'datetime',
            'phone_verified_at'  => 'datetime',
            'otp_expires_at'     => 'datetime',
            'password'           => 'hashed',
            'notif_bookings'     => 'boolean',
            'notif_events'       => 'boolean',
            'notif_offers'       => 'boolean',
        ];
    }

    /**
     * هل تم توثيق رقم الهاتف عبر واتساب OTP؟
     */
    public function isPhoneVerified(): bool
    {
        return !is_null($this->phone_verified_at);
    }

    /**
     * توحيد صيغة رقم الهاتف (أرقام فقط، مع إضافة رمز البلد الافتراضي +963 وإزالة الأصفار البادئة)
     */
    public static function normalizePhone(?string $phone): ?string
    {
        if (empty($phone)) {
            return $phone;
        }

        // الحفاظ على صيغة أرقام الفحص الخاصة بالبريد الإلكتروني
        if (str_starts_with($phone, 'DUMMY_')) {
            return $phone;
        }

        $phone = trim($phone);

        // Check if it already starts with + or 00 (international)
        if (str_starts_with($phone, '+') || str_starts_with($phone, '00')) {
            $digits = preg_replace('/\D/', '', $phone);
            if (str_starts_with($phone, '00')) {
                $digits = substr($digits, 2);
            }
            return '+' . $digits;
        }

        // إبقاء الأرقام فقط
        $digits = preg_replace('/\D/', '', $phone);

        // إذا كان يبدأ بـ 09 وطوله 10 (مثل 09XXXXXXXX)، نستبدل الـ 0 بـ 963
        if (str_starts_with($digits, '09') && strlen($digits) === 10) {
            $digits = '963' . substr($digits, 1);
        } elseif (str_starts_with($digits, '9') && strlen($digits) === 9) {
            // مثل 99XXXXXXXX -> 96399XXXXXXXX
            $digits = '963' . $digits;
        }

        return '+' . $digits;
    }

    /**
     * Mutator لتوحيد رقم الهاتف تلقائياً عند الحفظ في قاعدة البيانات
     */
    public function setPhoneAttribute($value)
    {
        $this->attributes['phone'] = self::normalizePhone($value);
    }

    public function playerProfile()
    {
        return $this->hasOne(PlayerProfile::class);
    }

    public function coachProfile()
    {
        return $this->hasOne(CoachProfile::class);
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function pilatesBookings()
    {
        return $this->hasMany(PilatesBooking::class);
    }

    public function userPilatesPackages()
    {
        return $this->hasMany(UserPilatesPackage::class);
    }

    public function staffProfile()
    {
        return $this->hasOne(StaffProfile::class);
    }

    public function eventRegistrations()
    {
        return $this->hasMany(EventRegistration::class);
    }

    protected static function booted(): void
    {
        static::created(function ($user) {

            if (!$user->playerProfile) {
                $user->playerProfile()->create([]);
            }

            if (!$user->wallet) {
                $user->wallet()->create([
                    'balance' => 0
                ]);
            }
        });
    }
}
