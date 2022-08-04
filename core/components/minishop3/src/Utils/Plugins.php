<?php

namespace MiniShop3\Utils;

use MiniShop3\MiniShop3;
use MODX\Revolution\modX;

class Plugins extends MiniShop3
{
    /**
     * Register plugin into miniShop3
     *
     * @param $name
     * @param $controller
     */
    public function add($name, $controller)
    {
        $plugins = $this->utils->getSetting('ms_plugins');
        $plugins[strtolower($name)] = $controller;

        $this->utils->updateSetting('ms_plugins', $plugins);
    }

    /**
     * Remove plugin from miniShop3
     *
     * @param $name
     */
    public function remove($name)
    {
        $plugins = $this->utils->getSetting('ms_plugins');
        unset($plugins[strtolower($name)]);
        $this->utils->updateSetting('ms_plugins', $plugins);
    }

    /**
     * Get all registered plugins
     *
     * @return array|mixed
     */
    public function get()
    {
        return $this->utils->getSetting('ms_plugins');
    }

    /**
     * Loads available plugins with parameters
     *
     * @return array
     */
    public function load()
    {
        $output = [];
        // Original plugins
        $plugins = scandir($this->config['pluginsPath']);
        foreach ($plugins as $plugin) {
            if ($plugin == '.' || $plugin == '..') {
                continue;
            }
            $dir = $this->config['pluginsPath'] . $plugin;

            if (is_dir($dir) && file_exists($dir . '/index.php')) {
                $include = include_once($dir . '/index.php');
                if (is_array($include)) {
                    $output[$plugin] = $include;
                }
            }
        }

        // 3rd party plugins
        $placeholders = array(
            'base_path' => MODX_BASE_PATH,
            'core_path' => MODX_CORE_PATH,
            'assets_path' => MODX_ASSETS_PATH,
        );
        $pl1 = $this->pdoFetch->makePlaceholders($placeholders, '', '[[++', ']]', false);
        $pl2 = $this->pdoFetch->makePlaceholders($placeholders, '', '{', '}', false);
        $plugins = $this->get();
        if (!empty($plugins) && is_array($plugins)) {
            foreach ($plugins as $plugin => $controller) {
                if (is_string($controller)) {
                    $file = $controller;
                } elseif (is_array($controller) && !empty($controller['controller'])) {
                    $file = $controller['controller'];
                } else {
                    continue;
                }

                $file = str_replace($pl2['pl'], $pl2['vl'], str_replace($pl1['pl'], $pl1['vl'], $file));
                if (strpos($file, MODX_BASE_PATH) === false && strpos($file, MODX_CORE_PATH) === false) {
                    $file = MODX_BASE_PATH . ltrim($file, '/');
                }
                if (!preg_match('#index\.php$#', $file)) {
                    $file = rtrim($file, '/') . '/index.php';
                }
                if (file_exists($file)) {
                    $include = include($file);
                    if (is_array($include)) {
                        $output[$plugin] = $include;
                    }
                } else {
                    $this->modx->log(modX::LOG_LEVEL_ERROR, "[miniShop3] Could not load plugin at \"$file\"");
                }
            }
        }

        return $output;
    }
}
