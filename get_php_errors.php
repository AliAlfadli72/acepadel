<?php
$logPath = 'C:/xampp/php/logs/php_error_log';
if (!file_exists($logPath)) {
    echo "PHP log file not found at $logPath.\n";
    exit;
}
$log = file_get_contents($logPath);
$lines = explode("\n", $log);
echo "--- LAST PHP ERRORS ---\n";
for ($j = max(0, count($lines) - 30); $j < count($lines); $j++) {
    echo $lines[$j] . "\n";
}
unlink(__FILE__); // self-destruct
