package models

import (
	"time"

	"github.com/google/uuid"
)

type Relation struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	SourceID     uuid.UUID `gorm:"type:uuid;not null" json:"source_id"`
	TargetID     uuid.UUID `gorm:"type:uuid;not null" json:"target_id"`
	RelationType string    `gorm:"type:varchar(50)" json:"relation_type"`
	Weight       float64   `gorm:"default:1" json:"weight"`
	CreatedAt    time.Time `json:"created_at"`
}
