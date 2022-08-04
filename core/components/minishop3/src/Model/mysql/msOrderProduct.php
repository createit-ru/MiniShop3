<?php

namespace MiniShop3\Model\mysql;

class msOrderProduct extends \MiniShop3\Model\msOrderProduct
{
    public static $metaMap = array(
        'package' => 'MiniShop3\\Model',
        'version' => '3.0',
        'table' => 'ms_order_products',
        'extends' => 'xPDO\\Om\\xPDOSimpleObject',
        'tableMeta' =>
            array(
                'engine' => 'InnoDB',
            ),
        'fields' =>
            array(
                'product_id' => NULL,
                'order_id' => NULL,
                'name' => NULL,
                'count' => 1,
                'price' => 0.0,
                'weight' => 0.0,
                'cost' => 0.0,
                'options' => NULL,
                'properties' => NULL,
            ),
        'fieldMeta' =>
            array(
                'product_id' =>
                    array(
                        'dbtype' => 'int',
                        'precision' => '10',
                        'phptype' => 'integer',
                        'attributes' => 'unsigned',
                        'null' => false,
                    ),
                'order_id' =>
                    array(
                        'dbtype' => 'int',
                        'precision' => '10',
                        'phptype' => 'integer',
                        'attributes' => 'unsigned',
                        'null' => false,
                    ),
                'name' =>
                    array(
                        'dbtype' => 'varchar',
                        'precision' => '255',
                        'phptype' => 'string',
                        'null' => true,
                    ),
                'count' =>
                    array(
                        'dbtype' => 'int',
                        'precision' => '10',
                        'phptype' => 'integer',
                        'attributes' => 'unsigned',
                        'null' => true,
                        'default' => 1,
                    ),
                'price' =>
                    array(
                        'dbtype' => 'decimal',
                        'precision' => '12,2',
                        'phptype' => 'float',
                        'null' => true,
                        'default' => 0.0,
                    ),
                'weight' =>
                    array(
                        'dbtype' => 'decimal',
                        'precision' => '13,3',
                        'phptype' => 'float',
                        'null' => true,
                        'default' => 0.0,
                    ),
                'cost' =>
                    array(
                        'dbtype' => 'decimal',
                        'precision' => '12,2',
                        'phptype' => 'float',
                        'null' => true,
                        'default' => 0.0,
                    ),
                'options' =>
                    array(
                        'dbtype' => 'text',
                        'phptype' => 'json',
                        'null' => true,
                    ),
                'properties' =>
                    array(
                        'dbtype' => 'text',
                        'phptype' => 'json',
                        'null' => true,
                    ),
            ),
        'indexes' =>
            array(
                'product_id' =>
                    array(
                        'alias' => 'product_id',
                        'primary' => false,
                        'unique' => false,
                        'type' => 'BTREE',
                        'columns' =>
                            array(
                                'product_id' =>
                                    array(
                                        'length' => '',
                                        'collation' => 'A',
                                        'null' => false,
                                    ),
                            ),
                    ),
                'order_id' =>
                    array(
                        'alias' => 'order_id',
                        'primary' => false,
                        'unique' => false,
                        'type' => 'BTREE',
                        'columns' =>
                            array(
                                'order_id' =>
                                    array(
                                        'length' => '',
                                        'collation' => 'A',
                                        'null' => false,
                                    ),
                            ),
                    ),
            ),
        'aggregates' =>
            array(
                'Product' =>
                    array(
                        'class' => 'MiniShop3\\Model\\msProduct',
                        'local' => 'product_id',
                        'foreign' => 'id',
                        'owner' => 'foreign',
                        'cardinality' => 'one',
                    ),
                'Order' =>
                    array(
                        'class' => 'MiniShop3\\Model\\msOrder',
                        'local' => 'order_id',
                        'foreign' => 'id',
                        'owner' => 'foreign',
                        'cardinality' => 'one',
                    ),
            ),
    );

}
