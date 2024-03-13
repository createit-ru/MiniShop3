<?php

namespace MiniShop3\Processors\Utilities\ExtraField;

use MiniShop3\Model\msExtraField;
use MODX\Revolution\Processors\Model\CreateProcessor;

class Create extends CreateProcessor
{
    /** @var msExtraField $object */
    public $object;
    public $classKey = msExtraField::class;
    public $languageTopics = ['minishop3'];
    public $permission = 'mssetting_save';


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


    /**
     * @return bool
     */
    public function beforeSet()
    {
        $required = ['class', 'key', 'dbtype', 'phptype'];
        foreach ($required as $field) {
            if (!$tmp = trim($this->getProperty($field))) {
                $this->addFieldError($field, $this->modx->lexicon('field_required'));
            } else {
                $this->setProperty($field, $tmp);
            }
        }

        $doesAlreasyExistCriteria = [
            'class' => $this->getProperty('class'),
            'key' => $this->getProperty('key')
        ];
        if ($this->doesAlreadyExist($doesAlreasyExistCriteria)) {
            $this->modx->error->addField('key', $this->modx->lexicon('ms3_err_ae'));
        }

        return !$this->hasErrors();
    }
}