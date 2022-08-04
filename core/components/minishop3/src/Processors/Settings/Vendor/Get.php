<?php

namespace MiniShop3\Processors\Settings\Vendor;

use MiniShop3\Model\msOrderStatus;
use MiniShop3\Model\msVendor;
use MODX\Revolution\Processors\Model\GetProcessor;

class Get extends GetProcessor
{
    public $object;
    public $classKey = msVendor::class;
    public $languageTopics = ['minishop'];
    public $permission = 'mssetting_view';


    /**
     * @return bool|null|string
     */
    public function initialize()
    {
        if (!$this->modx->hasPermission($this->permission)) {
            return $this->modx->lexicon('access_denied');
        }

        return parent::initialize();
    }
}
