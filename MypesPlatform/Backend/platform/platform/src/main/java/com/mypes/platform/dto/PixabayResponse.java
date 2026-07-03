package com.mypes.platform.dto;

import java.util.List;

import lombok.Data;

@Data
public class PixabayResponse {
    private List<PixabayHit> hits;
}
