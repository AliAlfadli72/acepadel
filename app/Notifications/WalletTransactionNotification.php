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
        $title = $this->action === 'add' ? 'شحن المحفظة 💰' : 'خصم من المحفظة 💳';
        $message = $this->action === 'add' 
            ? 'تم شحن محفظتك بمبلغ ' . $this->amount . ' ل.س. رصيدك الحالي: ' . $this->newBalance . ' ل.س.'
            : 'تم خصم مبلغ ' . $this->amount . ' ل.س من محفظتك. رصيدك الحالي: ' . $this->newBalance . ' ل.س.';

        return [
            'title' => $title,
            'message' => $message,
            'type' => 'wallet_transaction',
            'amount' => $this->amount,
            'new_balance' => $this->newBalance,
        ];
    }

    public function toFcm($notifiable)
    {
        $title = $this->action === 'add' ? 'شحن المحفظة 💰' : 'خصم من المحفظة 💳';
        $body = $this->action === 'add' 
            ? 'تم شحن محفظتك بمبلغ ' . $this->amount . ' ل.س. رصيدك الحالي: ' . $this->newBalance . ' ل.س.'
            : 'تم خصم مبلغ ' . $this->amount . ' ل.س من محفظتك. رصيدك الحالي: ' . $this->newBalance . ' ل.س.';

        return [
            'title' => $title,
            'body' => $body,
            'data' => [
                'type' => 'wallet_transaction',
            ]
        ];
    }
}
