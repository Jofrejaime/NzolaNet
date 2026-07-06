<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'       => 'Super Admin',
            'email'      => 'super@nzola.com',
            'password'   => bcrypt('12345678'),
            'role'       => 'superadministrador',
            'is_active'  => true,
            'is_private' => false,
        ]);
    }
}
