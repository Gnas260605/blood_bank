package com.bloodbank.app.repository;

import com.bloodbank.app.entity.User;
import com.bloodbank.app.entity.VerifyToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerifyTokenRepository extends JpaRepository<VerifyToken, String> {
    Optional<VerifyToken> findByToken(String token);

    List<VerifyToken> findByUserAndUsedFalse(User user);
}
