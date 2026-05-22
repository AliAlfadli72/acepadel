<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Channels\FcmChannel;

class WalletTransactionNotification extends Notification
{
    use Queueable;

    protected string $action;
    protected float $amount;
    protected float $newBalance;

    public function __construct(\App\Models\Transaction $transaction)
    {
        $this->action = $transaction->type === 'credit' ? 'add' : 'deduct';
        $this->amount = (float) $transaction->amount;
        $this->newBalance = (float) $transaction->balance_after;
    }

    public function via($notifiable)
    {
        return ['database', FcmChannel::class];
    }

    public function toDatabase($notifiable)
    {
        $titleAr = $this->action === 'add' ? 'شحن المحفظة 💰' : 'خصم من المحفظة 💳';
        $msgAr = $this->action === 'add' 
            ? 'تم شحن محفظتك بمبلغ ' . $this->amount . ' ل.س. رصيدك الحالي: ' . $this->newBalance . ' ل.س.'
            : 'تم خصم مبلغ ' . $this->amount . ' ل.س من محفظتك. رصيدك الحالي: ' . $this->newBalance . ' ل.س.';

        $titleEn = $this->action === 'add' ? 'Wallet Top-up 💰' : 'Wallet Deduction 💳';
        $msgEn = $this->action === 'add'
            ? 'Your wallet has been topped up with ' . $this->amount . ' SYP. Current balance: ' . $this->newBalance . ' SYP.'
            : 'An amount of ' . $this->amount . ' SYP has been deducted from your wallet. Current balance: ' . $this->newBalance . ' SYP.';

        return [
            'title_ar' => $titleAr,
            'message_ar' => $msgAr,
            'title_en' => $titleEn,
            'message_en' => $msgEn,
            // Fallback default
            'title' => $titleAr,
            'message' => $msgAr,
            'type' => 'wallet_transaction',
            'amount' => $this->amount,
            'new_balance' => $this->newBalance,
        ];
    }

    public function toFcm($notifiable)
    {
        $locale = $notifiable->locale ?? 'ar';

        if ($locale === 'en') {
            $title = $this->action === 'add' ? 'Wallet Top-up 💰' : 'Wallet Deduction 💳';
            $body = $this->action === 'add' 
                ? 'Your wallet has been topped up with ' . $this->amount . ' SYP. Current balance: ' . $this->newBalance . ' SYP.'
                : 'An amount of ' . $this->amount . ' SYP has been deducted from your wallet. Current balance: ' . $this->newBalance . ' SYP.';
        } else {
            $title = $this->action === 'add' ? 'شحن المحفظة 💰' : 'خصم من المحفظة 💳';
            $body = $this->action === 'add' 
                ? 'تم شحن محفظتك بمبلغ ' . $this->amount . ' ل.س. رصيدك الحالي: ' . $this->newBalance . ' ل.س.'
                : 'تم خصم مبلغ ' . $this->amount . ' ل.س من محفظتك. رصيدك الحالي: ' . $this->newBalance . ' ل.س.';
        }

        return [
            'title' => $title,
            'body' => $body,
            'data' => [
                'type' => 'wallet_transaction',
            ]
        ];
    }
}
