<?php

namespace MiniShop3\Processors\Settings\Payment;

class Disable extends Update
{
    /**
     * @return bool
     */
    public function beforeSet()
    {
        $this->properties = [
            'active' => false,
        ];

        return true;
    }
}
