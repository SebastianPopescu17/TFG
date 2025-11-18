<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as VerifyEmailBase;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

class CustomVerifyEmail extends VerifyEmailBase
{
    protected function verificationUrl($notifiable)
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())]
        );
    }

    public function toMail($notifiable)
    {
        $url = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verifica tu correo en InvesTrack')
            ->greeting('¡Hola ' . $notifiable->name . '!')
            ->line('Gracias por registrarte en **InvesTrack**, tu plataforma de inversión inteligente.')
            ->line('Antes de empezar a usar todas las funcionalidades premium, necesitamos que confirmes tu correo.')
            ->action('Verificar mi correo', $url)
            ->line('Este enlace caduca en 60 minutos.')
            ->salutation('El equipo de InvesTrack 💼');
    }
}
