<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

trait HasUuid
{
    protected static function bootHasUuid()
    {
        static::creating(function ($model) {
            if (
                property_exists($model, 'usesUuid') &&
                $model->usesUuid === true &&
                !$model->getKey()
            ) {
                $model->{$model->getKeyName()} = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function getIncrementing()
    {
        return !(property_exists($this, 'usesUuid') && $this->usesUuid === true);
    }

    public function getKeyType()
    {
        return (property_exists($this, 'usesUuid') && $this->usesUuid === true)
            ? 'string'
            : 'int';
    }
}

