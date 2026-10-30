<?php

const PRICE_LAWN_BASE = 80000;
const PRICE_LAWN_MID = 700;
const PRICE_LAWN_FAR = 500;
const PRICE_TREE_SMALL = 40000;
const PRICE_TREE_MID = 80000;
const PRICE_TREE_LARGE = 150000;
const PRICE_EDGE = 25000;
const PRICE_DELIVERY = 15000;
const PRICE_WEEK_FROM = 7;
const PRICE_WEEK_OFF = 0.15;
const PRICE_DEPOSIT = 0.30;

function price_num($value): int
{
    $n = (int) $value;
    return $n > 0 ? $n : 0;
}

function price_lawn(int $m2): int
{
    if ($m2 <= 0) {
        return 0;
    }
    $price = PRICE_LAWN_BASE;
    if ($m2 > 100) {
        $price += (min($m2, 300) - 100) * PRICE_LAWN_MID;
    }
    if ($m2 > 300) {
        $price += ($m2 - 300) * PRICE_LAWN_FAR;
    }
    return $price;
}

function price_trees(int $small, int $mid, int $large): int
{
    return $small * PRICE_TREE_SMALL + $mid * PRICE_TREE_MID + $large * PRICE_TREE_LARGE;
}

function price_rent(int $dayRate, int $qty, int $days): int
{
    $raw = $dayRate * $qty * $days;
    if ($days >= PRICE_WEEK_FROM) {
        return $raw - (int) round($raw * PRICE_WEEK_OFF);
    }
    return $raw;
}

function price_deposit(int $buyPrice, int $qty): int
{
    return (int) round($buyPrice * PRICE_DEPOSIT) * $qty;
}
